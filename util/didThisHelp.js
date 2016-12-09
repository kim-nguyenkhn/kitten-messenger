'use strict';

var messageUtil = require('../util/messageUtil'),
    async = require('async'),
    responses = require('../config/responses').Responses,
    random = require('../util/random');

var didThisHelp = {
  askForFeedback: function(recipientId, cb) {
    // text with 2 buttons -- yes/no
    messageUtil.sendMessageWithCallback(recipientId, {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"Did this help?",
          "buttons":[
            {
              "type":"postback",
              "title":"Yes",
              "payload":"PAYLOAD_DIDTHISHELP_YES"
            },
            {
              "type":"postback",
              "title":"No",
              "payload":"PAYLOAD_DIDTHISHELP_NO"
            }
          ]
        }
      }
    }, cb);
  },

  didHelp: function(recipientId) {
    async.series([
      // gif
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "attachment":{
            "type":"image",
            "payload":{
              "url": random.getRandomFromArray(responses.happy.gifs)
            }
          }
        }, cb);
      },
      // text
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "text": random.getRandomFromArray(responses.happy.text)
        }, cb);
      }
    ]);


  },

  // FAILED TO HELP
  didNotHelp: function(recipientId) {
    async.series([
      // reaction - gif
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "attachment":{
            "type":"image",
            "payload":{
              "url": random.getRandomFromArray(responses.sad.gifs)
            }
          }
        }, cb);
      },
      // suggestion text - talk to a rep
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "attachment":{
            "type":"template",
               "payload":{
                  "template_type":"button",
                  "text": random.getRandomFromArray(responses.sad.text) + " " + "Would you like to talk to a representative?",
                  "buttons":[
                     {
                        "type":"phone_number",
                        "title":"Call Representative",
                        "payload":"+18882211161"
                     }
                  ]
               }
          }
        }, cb);
      }
    ]);
  }
};

module.exports = didThisHelp;
