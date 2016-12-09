'use strict';

var request = require('request'),
    __ = require('underscore'),
    config = require('../config/config'),
    faqCategories = require('../config/faq').faqCategories,
    natural = require('natural'),
    TfIdf = natural.TfIdf;

var setTypingOn = function(recipientId) {
  request({
    url: config.baseUrls.facebookGraph + '/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      sender_action: 'typing_on'
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};

var setTypingOff = function(recipientId) {
  request({
    url: config.baseUrls.facebookGraph + '/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      sender_action: 'typing_off'
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};

// generic function sending messages
var sendMessage = function(recipientId, message) {
  request({
    url: config.baseUrls.facebookGraph + '/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      message: message
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};
var sendMessageWithCallback = function(recipientId, message, cb) {
  setTypingOn(recipientId);
  request({
    url: config.baseUrls.facebookGraph + '/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      message: message
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    } else {
      // adding a humanistic delay on the messages
      setTimeout(function(){
        setTypingOff(recipientId);
        cb(null, body);
      }, 1500);
    }
  });
};

// function for sending community search API results
var communitySearchMessage = function(recipientId, message) {
  request({
    url: 'https://www.paypal.com/selfhelp/community_search',
    qs: {q: message},
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type' : 'application/json; charset=utf-8'
    }
  }, function(error, response, body) {
    // typing bubbles on
    setTypingOn(recipientId);

    setTimeout(function() {
      if (error) {
        console.log('Error sending message: ', error);
      }
      else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
      else {
        var results = 'Response: ';
        body = JSON.parse(body);
        var organicResults = body.organicResults;
        if (organicResults) {
          __.each(body.organicResults, function(element, index) {
            console.log('Element: ', element);
            console.log('Element.linktext: ', element.linktext);
            console.log('Element.link: ', element.link);
            results += element.linktext + ': ' + element.link + ' ';
          });

          var msg, buttonTxt;
          for (var i = 0; i < Math.min(3, organicResults.length); i++) {
            msg = organicResults[i].link + ' \n';
            buttonTxt = organicResults[i].linktext;
            sendMessage(recipientId, {
              text: msg,
              quick_replies: [
                {
                  content_type: "text",
                  title: buttonTxt,
                  payload: "TODO_DEVELOPER_PREDEFINED_PAYLOAD"
                }
              ]
            });
          }
        }

        // console.log('Results: ', results);

        // sendMessage(recipientId, { text: results });
      }
      setTypingOff(recipientId);

    }, 5000);

    //typing bubbles off
  });
};

// send rich message with kitten
var kittenMessage = function(recipientId, text) {
  text = text || "";
  var values = text.split(' ');
  if (values.length === 3 && values[0] === 'kitten') {
    if (Number(values[1]) > 0 && Number(values[2]) > 0) {
      var imageUrl = config.baseUrls.placeKitten + Number(values[1]) + "/" + Number(values[2]);
      var message = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Kitten",
              "subtitle": "Cute kitten picture",
              "image_url": imageUrl ,
              "buttons": [{
                "type": "web_url",
                "url": imageUrl,
                "title": "Show kitten"
                }, {
                "type": "postback",
                "title": "I like this",
                "payload": "User " + recipientId + " likes kitten " + imageUrl,
              }]
            }]
          }
        }
      };
      sendMessage(recipientId, message);
      return true;
    }
  }
  return false;
};

// see https://dzone.com/articles/using-natural-nlp-module for documentation on 'Natural' module
// can also add Labels & Notes
var faqMessage = function(recipientId, text) {
  text = text || "";
  var logObj = {};

  // breaks text up into array of strings, and stems them all
  // takes param whether to ignore "stop words" (e.g., "I", "to", "at")
  var stemmer = natural.PorterStemmer || natural.LancasterStemmer;    // should investigate which performs better
  stemmer.attach();
  var stems = text.tokenizeAndStem(false);
  logObj.stems = stems;

  // weights all words in text by importance
  logObj.tfidf = [];
  var tfidf = new TfIdf();
  tfidf.addDocument(text);
  tfidf.listTerms(0).forEach(function(item) {
    logObj.tfidf.push({ term: item.term, tfidf: item.tfidf });
  });

  // two fundamental steps: training & classification
  var classifier = new natural.BayesClassifier();
  __.each(faqCategories, function(arr, category) {
    __.each(arr, function(elementObj) {
      classifier.addDocument(elementObj.title, category);
    });
  });
  classifier.train();
  // classifier.save('classifier.json', function(err, classifier) {
  //   if (err) {
  //     console.log(err);
  //   }
  // });
  var classification = classifier.classify(text);
  logObj.classification = classification;

  console.log(logObj);

  // ask back
  var message = { text: "Is this a question about: "+classification+"?" };

  sendMessage(recipientId, message);
};

var sendHelpMessage = function(recipientId) {
  var HELP_CONTENT = "Hey there, I'm Payton! 👋 I'm here to help you find the answers to your PayPal questions. Select a topic below or ask your question to start :)\nLater, you can type 'Help' to see these options again.";
  sendMessage(recipientId, {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": HELP_CONTENT,
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
};

module.exports = {
  sendMessage: sendMessage,
  sendMessageWithCallback: sendMessageWithCallback,
  kittenMessage: kittenMessage,
  faqMessage: faqMessage,
  communitySearchMessage: communitySearchMessage,
  sendHelpMessage: sendHelpMessage
};
