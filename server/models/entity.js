'use strict';
var mongoose = require('mongoose');

var entitySchema = new mongoose.Schema({
  identifier: {
    type: String,
    unique: true,
    lowercase: true
  },
  href: String,
  name: String,
  street: String,
  city: String,
  state: String,
  category: String,
  zipcode: String
});

module.exports = entitySchema;
