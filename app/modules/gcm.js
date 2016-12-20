var config = require('../../config');
var GCM = require('gcm').GCM;
var gcm = new GCM(config.gcmSenderKey);

var moduleExport = {};

moduleExport.sendNotification = function (data, regId) {
    var message = {
        "registration_id": regId,
        "collapse_key": 'Collapse key',
        "data": JSON.stringify(data)
    };
    gcm.send(message, function (err, messageId) {
        if (err) {
            console.log("GCM : GCM ID = " + regId);
            console.log("GCM : Something has gone wrong!" + err);
        } else {
            console.log("------IN-sendNotification-Data---");
            console.log(message);
            console.log("----------------------------------");
            console.log("GCM : Sent with message ID: ", messageId);
        }
    });
};
moduleExport.sendNotifications = function (gcmdata, gcms) {
    if (gcms.length != 0) {
        for (var i = 0; i < gcms.length; i++) {
            moduleExport.sendNotification(gcmdata, gcms[i]);
        }
    } else {
        console.log("GCMs is empty");
    }
}
moduleExport.getGCM = function () {
    return gcm;
};

moduleExport.insertGCMInDB = function (conn, userID, gcmId, callback) {
    var query = "INSERT INTO users_gcm (user_id, gcm) VALUES (?, ?)";

    var c = conn.query(query, [userID, gcmId], function (err, rows) {
        if (err) {
            console.log("GCM - Inserting GCM in DB Error.");
            console.log(err);
            callback(err, false);
            return;
        }
        callback(undefined, true);
        console.log("GCM - Inserted.");
    });
    return;
};

moduleExport.updateGCMInDB = function (conn, userID, oldGcmId, newGcmId, callback) {
    var query = "UPDATE users_gcm SET gcm = ? WHERE user_id = ? AND gcm = ?";

    var c = conn.query(query, [newGcmId, userID, oldGcmId], function (err, rows) {
        if (err) {
            console.log("GCM - Updating GCM in DB Error.");
            console.log(err);
            callback(err, false);
            return;
        }
        callback(undefined, true);
        console.log("GCM - Updated.");
    });
    return;
};


module.exports = moduleExport;