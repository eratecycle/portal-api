'use strict';
var mongoose = require('mongoose');

var invoiceSchema = new mongoose.Schema({
  identifier: {
    type: String,
    unique: true,
    lowercase: true
  },
  'tax_id': String,
  'invoice_date': String,
  'invoice_number': String,
  'account_number': String,
  'location_id': String,
  'location_name': String,
  'service_id': String,
  'service_code': String,
  'service_type': String,
  'charge_type': String,
  'charge_amount': {type: Number, get: getCharge, set: setCharge },
  'tax_amount': {type: Number, get: getCharge, set: setCharge }
});

function getCharge(num){
    return (num/100).toFixed(2);
}

function setCharge(num){
    return num*100;
}

module.exports = invoiceSchema;
