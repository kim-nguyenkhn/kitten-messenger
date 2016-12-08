'use strict';

var request = require('request'),
    __ = require('underscore'),
    config = require('../config/config'),
    faqCategories = require('../config/faq').faqCategories,
    natural = require('natural'),
    TfIdf = natural.TfIdf;

// generic function sending messages
var sendMessage = function(recipientId, message) {
  request({
    url: config.baseUrls.facebookGraph + '/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: recipientId},
      message: message,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};

// function for sending community search API results
var communitySearchMessage = function(recipientId, message) {
  request({
    url: 'https://www.paypal.com/selfhelp/community_search/?q=' + message,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type' : 'application/json; charset=utf-8'
    }
  }, function(error, response, body) {
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

        for (var i = 0; i < Math.min(3, organicResults.length); i++) {
          sendMessage(recipientId, { text: organicResults[i] });
        });
      }

      // console.log('Results: ', results);

      // sendMessage(recipientId, { text: results });
    }
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

module.exports = {
  sendMessage: sendMessage,
  kittenMessage: kittenMessage,
  faqMessage: faqMessage,
  communitySearchMessage: communitySearchMessage
};
