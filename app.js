'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var routes = require('./routes/index');
var config = require('./config/config');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/', routes);

app.listen((process.env.PORT || 3000));

// very basic keepalive ping
setInterval(function() {
  request(config.baseUrls.herokuApp, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('Pong');
    }
  });
}, 1500000); // every 25 minutes
