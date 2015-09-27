'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  identifier: {
    type: String,
    unique: true,
    lowercase: true
  },
  'file_name': String,
  'path_name': String,
  'date_added': {type: Date, default: Date.now}
});

module.exports = schema;
