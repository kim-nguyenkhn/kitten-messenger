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

// get started button
request({
  url: config.baseUrls.facebookGraph + '/v2.6/me/thread_settings',
  qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
  method: 'POST',
  json: {
    "setting_type":"call_to_actions",
    "thread_state":"new_thread",
    "call_to_actions":[
      {
        "payload":"PAYLOAD_NEW_THREAD"
      }
    ]
  }
}, function(error, response, body) {
  if (error) {
    console.log('Error sending message: ', error);
  } else if (response.body.error) {
    console.log('Error: ', response.body.error);
  }
});

// greeting
request({
  url: config.baseUrls.facebookGraph + '/v2.6/me/thread_settings',
  qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
  method: 'POST',
  json: {
    "setting_type":"greeting",
    "greeting":{
      "text": "Hi there - I'm Payton, PayPal's Customer Service Bot!"
    }
  }
}, function(error, response, body) {
  if (error) {
    console.log('Error sending message: ', error);
  } else if (response.body.error) {
    console.log('Error: ', response.body.error);
  }
});

// persistent menu
request({
  url: config.baseUrls.facebookGraph + '/v2.6/me/thread_settings',
  qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
  method: 'POST',
  json: {
    "setting_type":"call_to_actions",
    "thread_state" : "existing_thread",
    "call_to_actions":[
      {
        "type":"postback",
        "title":"Help",
        "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_HELP"
      },
      {
        "type":"web_url",
        "title":"Call Customer Support",
        "url":"https://www.paypal.com/us/selfhelp/contact/call",
        "webview_height_ratio": "full"
      },
      {
        "type":"web_url",
        "title":"Go to PayPal",
        "url":"https://www.paypal.com"
      }
    ]
  }
}, function(error, response, body) {
  if (error) {
    console.log('Error sending message: ', error);
  } else if (response.body.error) {
    console.log('Error: ', response.body.error);
  }
});

// very basic keepalive ping
setInterval(function() {
  request(config.baseUrls.herokuApp, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log('Pong');
    }
  });
}, 1500000); // every 25 minutes
