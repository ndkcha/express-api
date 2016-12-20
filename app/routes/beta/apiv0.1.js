var config = require('../../../config');
var jwt = require('jsonwebtoken');
var accessSecret = config.accessSecret;
var mysql = require('mysql');
var moment = require('moment');
var md5 = require('md5');
var pool = mysql.createPool(config.mysqlPoolConfig);
var _ = require("underscore");

var commonFunctions = require("../../commons/common-functions")
var gcm = require('../../modules/gcm');

// Some changes

module.exports = function (app, express) {

    // get an instance of the express router
    var apiRouter = express.Router();

    // route to authenticate a user (POST http://localhost:8080/api/authenticate)
    apiRouter.post('/authenticate', function (req, res) {
        pool.getConnection(function (err, connection) {
            if (err) {
                // connection.release();
                res.json({
                    "code": 100,
                    "status": "Error in connecting db"
                });
                return;
            }
            if (req.body.email) {
                var clause_name = "email";
                var clause = req.body.email;
            } else {
                var clause_name = "mobile";
                var clause = req.body.mobile;
            }
            console.log('Clause Name: ' + clause_name);
            console.log('Clause: ' + clause);
            console.log('Password: ' + req.body.password);
            var c = connection.query('SELECT * FROM users WHERE ?? = ? AND password = ?', [clause_name, clause, req.body.password], function (err, rows) {
                connection.release();
                if (!err) {
                    if (!rows.length) {
                        res.json({
                            success: false,
                            message: 'Authentication Failed, User not found.'
                        });
                    } else {
                        // creating token
                        var token = jwt.sign({
                            user_id: rows[0].id
                        }, accessSecret, {
                            expiresIn: 2592000
                        });
                        // returning status along with token
                        res.json({
                            success: true,
                            message: 'Enjoy your token',
                            token: token
                        });
                    }
                }
            });
            connection.on('error', function (err) {
                console.log('Error in connection with Database');
                return;
            });
        });
    });



    // route middleware to verify a token
    apiRouter.use(function (req, res, next) {
        // do logging
        console.log('Somebody just came to our app!');
        // check header or url parameters or post parameters for token
        var token = req.headers['x-access-token'];
        // decode token
        if (token) {
            // verifies secret and checks exp
            jwt.verify(token, accessSecret, function (err, decoded) {
                if (err) {
                    console.log('Failed to authenticate token.');
                    return res.json({
                        success: false,
                        message: 'Failed to authenticate token.'
                    });
                } else {
                    // if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                    console.log('User logged in: ' + req.decoded.user_id);
                    pool.getConnection(function (err, connection) {
                        if (err) {
                            connection.release();
                            res.json({
                                "code": 100,
                                "status": "Error in connecting db"
                            });
                            return;
                        }
                        connection.query('SELECT * FROM workshops_users WHERE user_id = ? AND role_id = 1', req.decoded.user_id, function (err, rows) {
                            connection.release();
                            if (!err) {
                                if (!rows.length) {
                                    console.log('User not privileged');
                                    return res.json({
                                        success: false,
                                        message: 'Your are not founder!'
                                    });
                                } else {
                                    req.workshop_id = rows[0].workshop_id;
                                    // FUTURETODO this won't work when single user is owner of multiple workshops
                                    next();
                                }
                            } else {
                                console.log('Error!');
                            }
                        });
                    });
                    // next(); // make sure we go to the next routes and don't stop here //UPDATE moving next in if close upstairs, to change route only after getting the service centre id.
                }
            });
        } else {
            // if there is no token
            // return an HTTP response of 403 (access forbidden) and an error message
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    });

    // accessed at GET http://localhost:8080/api
    apiRouter.get('/', function (req, res) {
        res.json({
            message: 'Welcome to Cruzer CRM!'
        });
    });

 
    // on routes that end for tables
    // ----------------------------------------------------
    apiRouter.route('/:table')
        .post(function (req, res) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    connection.release();
                    res.json({
                        "code": 100,
                        "status": "Error in connecting db"
                    });
                    return;
                }
                connection.query('INSERT INTO ?? SET ?', [req.params.table, req.body], function (err, result) {
                    connection.release();
                    if (!err) {
                        console.log('Success ID: ' + result.insertId);
                        return res.json({
                            success: true,
                            message: 'Record added.',
                            id: result.insertId
                        });
                    } else {
                        console.log(err);
                        console.log(req.body);
                        return res.json({
                            success: false,
                            message: 'Something went wrong in post request.'
                        });
                    }
                });
            });
        })
        .get(function (req, res) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    connection.release();
                    res.json({
                        "code": 100,
                        "status": "Error in connecting db"
                    });
                    return;
                }
                connection.query('SELECT * FROM ??', req.params.table, function (err, rows) {
                    connection.release();
                    if (!err) {
                        if (!rows.length) {
                            res.json({
                                success: false,
                                message: 'Record not found.'
                            });
                        } else {
                            res.json(rows);
                        }
                    } else {
                        console.log(err);
                        console.log(req.body);
                        return res.json({
                            success: false,
                            message: 'Something went wrong in get request.'
                        });
                    }
                });
            });
        });


    apiRouter.route('/:table/:column/:value')
        .get(function (req, res) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    connection.release();
                    res.json({
                        "code": 100,
                        "status": "Error in connecting db"
                    });
                    return;
                }
                connection.query('SELECT id,name FROM ?? WHERE ?? like ?', [req.params.table, req.params.column, req.params.value], function (err, rows) {
                    connection.release();
                    if (!err) {
                        if (!rows.length) {
                            res.json({
                                success: false,
                                message: 'Record not found.'
                            });
                        } else {
                            res.json({
                                models: rows,
                            });
                        }
                    } else {
                        console.log(err);
                        console.log(req.body);
                        return res.json({
                            success: false,
                            message: 'Something went wrong in specific get request.'
                        });
                    }
                });
            });
        })

    .put(function (req, res) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    connection.release();
                    res.json({
                        "code": 100,
                        "status": "Error in connecting db"
                    });
                    return;
                }
                console.log('connected for updating user as id ' + connection.threadId);
                console.log(req.body);
                connection.query('UPDATE ?? SET ? WHERE ?? = ?', [req.params.table, req.body, req.params.column, req.params.value], function (err, result) {
                    connection.release();
                    if (!err) {
                        return res.json({
                            success: true,
                            message: 'Record updated.'
                        });
                    } else {
                        console.log(err);
                        console.log(req.body);
                        return res.json({
                            success: false,
                            message: 'Something went wrong in specific put request.',
                            error: err
                        });
                    }
                });
            });
        })
        .delete(function (req, res) {
            pool.getConnection(function (err, connection) {
                if (err) {
                    connection.release();
                    res.json({
                        "code": 100,
                        "status": "Error in connecting db"
                    });
                    return;
                }
                console.log('connected for deleting user as id ' + connection.threadId);
                console.log(req.body);
                connection.query('DELETE FROM ?? WHERE ?? = ?', [req.params.table, req.params.column, req.params.value], function (err, result) {
                    connection.release();
                    if (!err) {
                        return res.json({
                            success: true,
                            message: 'Record deleted.',
                            users: result.affectedRows
                        });
                    } else {
                        console.log(err);
                        console.log(req.body);
                        return res.json({
                            success: false,
                            message: 'Something went wrong in specific delete request.',
                            error: err
                        });
                    }
                });
            });
        });


    return apiRouter;
};