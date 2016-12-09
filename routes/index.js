'use strict';

var express = require('express'),
    request = require('request'),
    router = express.Router(),
    messageUtil = require('../util/messageUtil'),
    cantLogin = require('../util/cantLogin'),
    didThisHelp = require('../util/didThisHelp'),
    sendMoney = require('../util/sendMoney'),
    editAccount = require('../util/editAccount'),
    config = require('../config/config');

function sendHelpMessage(recipientId) {
  messageUtil.sendMessage(recipientId, {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Hey there, I'm Payton! 👋 Find out how you can interact with me by typing 'Help'.",
        "buttons":[
          {
            // forgot my password https://www.paypal.com/us/selfhelp/article/i-forgot-my-password.-how-do-i-reset-it-faq1933/1
            // can't log in https://www.paypal.com/us/selfhelp/article/what-can-i-do-if-i-can't-i-log-in-faq1935/2
            "type":"postback",
            "title":"I can't log in",
            "payload":"PAYLOAD_CANT_LOGIN"
          },
          {
            // how do I send money https://www.paypal.com/us/selfhelp/article/how-do-i-send-money-faq1684/1
            "type":"postback",
            "title":"How to send money",
            "payload":"PAYLOAD_SEND_MONEY"
          },
          {
            // View or edit account info https://www.paypal.com/us/selfhelp/article/how-do-i-view-or-edit-my-account-information-faq772
            "type":"postback",
            "title":"Change account info",
            "payload":"PAYLOAD_EDIT_ACCOUNT_INFO"
          }
        ]
      }
    }
  });
}

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

        //HELP MESSAGE
        if (event.message.text.indexOf('help') >= 0) {
          sendHelpMessage(event.sender.id);
        }

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
          // var userDetails;
          // request({
          //   url: config.baseUrls.facebookGraph + '/v2.6/' + event.sender.id,
          //   qs: {access_token: process.env.PAGE_ACCESS_TOKEN}
          // }, function(error, response, body) {
          //   userDetails = body;
          //   console.log('userDetails', userDetails);
          // });
          sendHelpMessage(event.sender.id);
        }

        // can't login
        if (event.postback.payload.indexOf('PAYLOAD_CANT_LOGIN') > -1) {
          cantLogin.initCantLoginFlow(event.sender.id);
        }
        // forgot email
        if (event.postback.payload.indexOf('PAYLOAD_FORGOT_EMAIL') > -1) {
          cantLogin.forgotEmail(event.sender.id);
        }
        // forgot password
        if (event.postback.payload.indexOf('PAYLOAD_FORGOT_PASSWORD') > -1) {
          cantLogin.forgotPassword(event.sender.id);
        }


        // send money
        if (event.postback.payload.indexOf('PAYLOAD_SEND_MONEY') > -1) {
          sendMoney.initSendMoneyFlow(event.sender.id);
        }


        // edit account info
        if (event.postback.payload.indexOf('PAYLOAD_EDIT_ACCOUNT_INFO') > -1) {
          editAccount.initEditAccountFlow(event.sender.id);
        }

        // did help
        if (event.postback.payload.indexOf('PAYLOAD_DIDTHISHELP_YES') > -1) {
          didThisHelp.didHelp(event.sender.id);
        }
        // did not help
        if (event.postback.payload.indexOf('PAYLOAD_DIDTHISHELP_NO') > -1) {
          didThisHelp.didNotHelp(event.sender.id);
        }


      }
    }
    res.sendStatus(200);
  });

module.exports = router;
