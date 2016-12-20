var express = require('express'); // call express
var app = express(); // defining app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var config = require('./config');
var path = require('path');
var cors = require('cors');

// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//CORS - Cross Site Resources Sharing
app.use(cors());


// configure our app to handle CORS requests
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    next();
});

// log all requests to the console 
app.use(morgan('combined'));

// ROUTES FOR OUR API
// ======================================

// API ROUTES ------------------------
var apiRoutesV0_1 = require('./app/routes/beta/apiv0.1')(app, express);
app.use('/api/0.1', apiRoutesV0_1);

// START THE SERVER
// =============================================================================
app.listen(config.port);
console.log('Admin APIs listening on port ' + config.port);