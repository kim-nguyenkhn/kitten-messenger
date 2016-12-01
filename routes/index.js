'use strict';

var express = require('express'),
    router = express.Router(),
    messageUtil = require('../util/messageUtil'),
    config = require('../config/config');

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now());
  next();
});

// Server frontpage
router.get('/', function (req, res) { res.send('This is TestBot Server'); });

// Facebook Webhook
router.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
      res.send(req.query['hub.challenge']);
    } else {
      res.send('Invalid verify token');
    }
  }).post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging, i;
    for (i = 0; i < events.length; i++) {
      var event = events[i];
      if (event.message && event.message.text) {
        if (!messageUtil.kittenMessage(event.sender.id, event.message.text)) {
            // messageUtil.sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
            messageUtil.faqMessage(event.sender.id, event.message.text);
        }
      } else if (event.postback) {
        console.log("Postback received: " + JSON.stringify(event.postback));
      }
    }
    res.sendStatus(200);
  });

module.exports = router;
