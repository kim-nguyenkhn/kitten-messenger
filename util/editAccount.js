'use strict';

var messageUtil = require('../util/messageUtil'),
    async = require('async'),
    responses = require('../config/responses').Responses,
    didThisHelp = require('../util/didThisHelp'),
    random = require('../util/random');

var editAccount = {
  initEditAccountFlow: function(recipientId) {
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

      // give instructions on how to edit account details
      function(cb) {
        var EDIT_ACCOUNT_CONTENT_PT1 = random.getRandomFromArray(responses.smart.text) + " " + "Here are the steps that I found:\n1. Log in to your PayPal account.\n2. Click the Profile icon next to \"Log out.\"\n3. To change any of your personal information, click any option and follow the steps provided.\n";

        async.series([
          function(cb) {
            messageUtil.sendMessageWithCallback(recipientId, {
              "text": EDIT_ACCOUNT_CONTENT_PT1
            }, cb);
          },
          function(cb) {
            messageUtil.sendMessageWithCallback(recipientId, {
              "text": responses.forMore.editAccount
            }, cb);
          },
          function(cb) {
            didThisHelp.askForFeedback(recipientId, cb);
          }
        ]);
      }
    ]);
  }

};

module.exports = editAccount;
