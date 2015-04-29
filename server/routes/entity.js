/**
 * Entity Routes
 */

'use strict';

var entityController = require('../controllers/entity');
var auth = require('../auth');

var routes = function(app) {

  app.get('/entity/search', auth.isAuthenticated, entityController.entitySearch);

};

module.exports = routes;
