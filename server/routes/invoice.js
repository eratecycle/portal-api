/**
 * Invoice Routes
 */

'use strict';

var invoiceController = require('../controllers/invoice');
var auth = require('../auth');

var routes = function(app) {

  app.get('/invoice/locations', auth.isAuthenticated, invoiceController.getLocations);
  app.get('/invoice/charges', auth.isAuthenticated, invoiceController.getCharges);
  app.get('/invoice/services', auth.isAuthenticated, invoiceController.getServices);
  app.get('/invoice/service-rates', auth.isAuthenticated, invoiceController.getServiceRates);

};

module.exports = routes;
