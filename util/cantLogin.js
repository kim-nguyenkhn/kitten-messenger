'use strict';

var messageUtil = require('../util/messageUtil'),
    async = require('async'),
    responses = require('../config/responses').Responses;

var cantLogin = {
  initCantLoginFlow: function(recipientId) {
    messageUtil.sendMessage(recipientId, {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": responses.sad.text[0],
            "image_url": responses.sad.gifs[0]
          }]
        }
      }
    });

    // var INIT_CANT_LOGIN_FLOW_CONTENT = "Sorry to hear that :( Select the option that applies to you below.";
    var INIT_CANT_LOGIN_FLOW_CONTENT = "Select the option that applies to you below.";
    messageUtil.sendMessage(recipientId, {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": INIT_CANT_LOGIN_FLOW_CONTENT,
          "buttons":[
            {
              // forgot my password https://www.paypal.com/us/selfhelp/article/i-forgot-my-password.-how-do-i-reset-it-faq1933/1
              // can't log in https://www.paypal.com/us/selfhelp/article/what-can-i-do-if-i-can't-i-log-in-faq1935/2
              "type":"postback",
              "title":"Forgot Email",
              "payload":"PAYLOAD_FORGOT_EMAIL"
            },
            {
              // how do I send money https://www.paypal.com/us/selfhelp/article/how-do-i-send-money-faq1684/1
              "type":"postback",
              "title":"Forgot Password",
              "payload":"PAYLOAD_FORGOT_PASSWORD"
            }
          ]
        }
      }
    });
  },

  forgotEmail: function(recipientId) {
    var FORGOT_EMAIL_CONTENT = "I forgot the email address tied to my PayPal account:\n 1. Go to www.paypal.com.\n 2. Click \"Log In\" at the top of the page.\n 3. Click \"Having trouble logging in?\"\n 4. Click \"Forgot?\" next to \"Email.\"\n 5. Select \"I don't know what email address I used and follow the instructions on the screen.\"";
    messageUtil.sendMessage(recipientId, {
      "text": FORGOT_EMAIL_CONTENT
    });

  },

  forgotPassword: function(recipientId) {
    var FORGOT_PASSWORD_CONTENT_PT1 = "I know my email address, but I don’t know my password:\n 1. Go to www.paypal.com.\n 2. Click Log In at the top of the page.\n 3. Click Having trouble logging in? (*do NOT close out of this window or you'll need to restart the password reset process.)\n 4. Type the email address you use for PayPal and click Next.";
    var FORGOT_PASSWORD_CONTENT_PT2 = "5. Select Receive an email so we can confirm this is your account, and click Next.\n 6. Enter the 6-digit security code we sent to your email (you many need to check or junk or spam folder) and click Continue.\n 7. Select another way of confirming this is your account, and click Next.\n 8. After going through this last security check, create a new password (type it twice) and click Update.";
    // content getting queued in reverse order because of some known issues below:
    // see https://developers.facebook.com/bugs/565416400306038
    // and http://stackoverflow.com/questions/37152355/facebook-messenger-bot-not-sending-messages-in-order
    async.series([
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "text": FORGOT_PASSWORD_CONTENT_PT1
        }, cb);
      },
      function(cb) {
        setTimeout(function() {
          // do nothing, just sleeping
        }, 3000);
        cb(null);
      },
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "text": FORGOT_PASSWORD_CONTENT_PT2
        }, cb);
      }
    ]);
  }

};

module.exports = cantLogin;
