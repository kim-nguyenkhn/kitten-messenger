'use strict';

var messageUtil = require('../util/messageUtil');


var cantLogin = {
  initCantLoginFlow: function() {
    var INIT_CANT_LOGIN_FLOW_CONTENT = "Sorry to hear that :( Select the option that applies to you below.";
    messageUtil.sendMessage(event.sender.id, {
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

  forgotEmail: function() {
    var FORGOT_EMAIL_CONTENT = "I forgot the email address tied to my PayPal account:\n 1. Go to www.paypal.com.\n 2. Click \"Log In\" at the top of the page.\n 3. Click \"Having trouble logging in?\"\n 4. Click \"Forgot?\" next to \"Email.\"\n 5. Select \"I don't know what email address I used and follow the instructions on the screen.\""
    messageUtil.sendMessage(event.sender.id, {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": FORGOT_EMAIL_CONTENT,
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

  forgotPassword: function() {
    var FORGOT_PASSWORD_CONTENT = "I know my email address, but I don’t know my password:\n 1. Go to www.paypal.com.\n 2. Click Log In at the top of the page.\n 3. Click Having trouble logging in? (*do NOT close out of this window or you'll need to restart the password reset process.)\n 4. Type the email address you use for PayPal and click Next.\n 5. Select Receive an email so we can confirm this is your account, and click Next.\n 6. Enter the 6-digit security code we sent to your email (you many need to check or junk or spam folder) and click Continue.\n 7. Select another way of confirming this is your account, and click Next.\n 8. After going through this last security check, create a new password (type it twice) and click Update."
    messageUtil.sendMessage(event.sender.id, {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": FORGOT_PASSWORD_CONTENT,
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
  }

};

module.exports = cantLogin;
