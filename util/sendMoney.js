'use strict';

var messageUtil = require('../util/messageUtil'),
    async = require('async'),
    responses = require('../config/responses').Responses,
    didThisHelp = require('../util/didThisHelp'),
    random = require('../util/random');

var sendMoney = {
  initSendMoneyFlow: function(recipientId) {
    async.series([

      // gif reaction
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "attachment":{
            "type":"image",
            "payload":{
              "url": random.getRandomFromArray(responses.smart.gifs)
            }
          }
        }, cb);
      },

      // give instructions for sending money
      function(cb) {
        var SEND_MONEY_CONTENT_PT1 = random.getRandomFromArray(responses.smart.text) + " " + "Here are the steps that I found:\n 1. Log in to your PayPal account. \n 2. Click Send & Request at the top of the page. \n 3. Select from the 3 options.* \n 4. Enter the email address or mobile number to whom you are sending money. \n 5. Enter the amount you want to send and click Continue.\n 6. Review and confirm the information on the screen and click Send Money Now.";
        var SEND_MONEY_CONTENT_PT2 = "*If you're buying something, select Pay for goods and services. If you're sending money to a friend or family member, pick Send to friends and family in the US or internationally.";

        async.series([
          function(cb) {
            messageUtil.sendMessageWithCallback(recipientId, {
              "text": SEND_MONEY_CONTENT_PT1
            }, cb);
          },
          function(cb) {
            messageUtil.sendMessageWithCallback(recipientId, {
              "text": SEND_MONEY_CONTENT_PT2
            }, cb);
          }, function(cb) {
            didThisHelp.askForFeedback(recipientId, cb);
          }
        ]);
      }
    ]);

  }
};

module.exports = sendMoney;
