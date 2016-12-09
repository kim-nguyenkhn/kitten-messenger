'use strict';

var messageUtil = require('../util/messageUtil'),
    async = require('async'),
    responses = require('../config/responses').Responses;

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
              "url": responses.happy.gifs[0]
            }
          }
        }, cb);
      },
      // text
      function(cb) {
        messageUtil.sendMessageWithCallback(recipientId, {
          "text": responses.happy.text[2]
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
              "url": responses.sad.gifs[0]
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
                  "text": responses.sad.text[1] + " " + "Would you like to talk to a representative?",
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
