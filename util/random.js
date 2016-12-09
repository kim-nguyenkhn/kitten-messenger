'use strict';

var random = {
  getRandomFromArray: function(array) {
    var len = array.length;
    var randyIndex = Math.floor(Math.random() * len);
    return array[randyIndex];
  }
};

module.exports = random;
