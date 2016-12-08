'use strict';

var express = require('express'),
    router = express.Router(),
    messageUtil = require('../util/messageUtil'),
    cantLogin = require('../util/cantLogin'),
    didThisHelp = require('../util/didThisHelp'),
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
        if (event.message.text.length >= 3 && event.message.text.toLowerCase().startsWith('pp')) {
          messageUtil.communitySearchMessage(event.sender.id, event.message.text);
        }
        else if (!messageUtil.kittenMessage(event.sender.id, event.message.text)) {
            messageUtil.sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
            // messageUtil.faqMessage(event.sender.id, event.message.text);
        }
      } else if (event.postback) {
        console.log("Postback received: " + JSON.stringify(event.postback));

        // TODO: handle event.postback.payload
        if (event.postback.payload.indexOf('PAYLOAD_NEW_THREAD') > -1) {
          messageUtil.sendMessage(event.sender.id, {
            "attachment": {
              "type": "template",
              "payload": {
                "template_type": "button",
                "text": "Hi! I'm PPBot. Find out how you can interact with me by typing 'Help'.",
                "buttons":[
                  {
                    // forgot my password https://www.paypal.com/us/selfhelp/article/i-forgot-my-password.-how-do-i-reset-it-faq1933/1
                    // can't log in https://www.paypal.com/us/selfhelp/article/what-can-i-do-if-i-can't-i-log-in-faq1935/2
                    "type":"postback",
                    "title":"I Can't Log In",
                    "payload":"PAYLOAD_CANT_LOGIN"
                  },
                  {
                    // how do I send money https://www.paypal.com/us/selfhelp/article/how-do-i-send-money-faq1684/1
                    "type":"postback",
                    "title":"How do I Send Money",
                    "payload":"PAYLOAD_SEND_MONEY"
                  },
                  {
                    // View or edit account info https://www.paypal.com/us/selfhelp/article/how-do-i-view-or-edit-my-account-information-faq772
                    "type":"postback",
                    "title":"View/Edit Account Info",
                    "payload":"PAYLOAD_EDIT_ACCOUNT_INFO"
                  }
                ]
              }
            }
          });
        }

        // forgot email
        if (event.postback.payload.indexOf('PAYLOAD_FORGOT_EMAIL') > -1) {
          cantLogin.forgotEmail();
        }

        // forgot password
        if (event.postback.payload.indexOf('PAYLOAD_FORGOT_PASSWORD') > -1) {
          cantLogin.forgotPassword();
        }

        // send money
        if (event.postback.payload.indexOf('PAYLOAD_SEND_MONEY') > -1) {
          messageUtil.sendMessage(event.sender.id, {

          });
        }

        // edit account info
        if (event.postback.payload.indexOf('PAYLOAD_EDIT_ACCOUNT_INFO') > -1) {
          messageUtil.sendMessage(event.sender.id, {

          });
        }



      }
    }
    res.sendStatus(200);
  });

module.exports = router;
