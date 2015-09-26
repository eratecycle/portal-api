var csv = require('./csv');
var mongoose = require('mongoose');
var db = require('../server/config/database')();

// Verify database connection
mongoose.connection.on('connected', function() {
  console.log('✔ MongoDB Connection Success!'.green);
});

mongoose.connection.on('error', function() {
  throw '✗ MongoDB Connection Error. Please make sure MongoDB is running.'.red;
});


var csvMappings = [
  {col: 'AT&T TAX NO', prop:'tax_id'},
  {col: 'INVOICE DATE', prop:'invoice_date'},
  {col: 'INVOICE NUMBER', prop: 'invoice_number'},
  {col: 'MASTER ACCOUNT NUMBER', prop: 'account_number'},
  {col: 'GROUP NUMBER', prop: 'location_id'},
  {col: 'GROUP LABEL', prop: 'location_name'},
  {col: 'SERVICE TYPE CODE', prop: 'service_code'},
  {col: 'SERVICE TYPE', prop: 'service_type'},
  {col: 'SERVICE DESCRIPTION', occurrence: 2, prop: 'charge_type'},
  {col: 'PREDISCOUNTED CHARGE', occurrence: 2, prop: 'charge_amount'},
  {col: 'TAX', prop: 'tax_amount'},
]

//adjust this path to the correct location
var fileName = '/Users/nicknance/Downloads/ycsd_csv_original_files/8310002754302_UB_MNS_01012015_9218116203_64206663.csv';
csv.importFile(mongoose, fileName, csvMappings, 'invoice', function(){
  mongoose.disconnect();
});
