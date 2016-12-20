var _ = require("underscore");
var functionsExports = {};
var dbFunctions = {};

functionsExports.getGCMFromVehicleId = function (vehicleId, connection) {

}

dbFunctions.updateQueryFromJSON = function (tableName, jsonKeyValue, whereClause) {
    var queryString = 'UPDATE ' + tableName + ' SET ';
    // var jsonKeyValueSize = _.size(jsonKeyValue);
    _.mapObject(jsonKeyValue, function (val, key) {
        if (_.isString(val))
            queryString += (key + "='" + val + "',");
        else
            queryString += (key + "=" + val + ",");
    });
    queryString = queryString.substr(0, queryString.length - 1)
    if (whereClause && whereClause !== '') {
        queryString += ' WHERE ' + whereClause;
    }
    return queryString;
};

dbFunctions.getGCMFromWorkshopId = function (conn, workshopId, callback) {
    var query = " SELECT DISTINCT ug.id, ug.gcm  FROM users_gcm ug JOIN workshops_users wu ON ug.user_id = wu.user_id WHERE wu.workshop_id = ?"
    var c = conn.query(query, workshopId, function (err, rows) {
        var gcms = [],
            userId = -1;
        if (err) {
            console.log("Error : dbFunctions.getGCMFromServiceId : serviceId = " + serviceId);
            console.log(c.sql);
            callback(err, gcms);
            return;
        }
        //Get GCM and User ID
        if (rows.length != 0) {
            for (var i = 0; i < rows.length; i++) {
                gcms.push(rows[i].gcm);
            }
            userId = rows[0].user_id;
        }
        callback(err, gcms, userId);
    });
};

functionsExports.dbFunctions = dbFunctions;
module.exports = functionsExports;