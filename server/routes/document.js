/**
 * Auth Routes
 */

'use strict';

var multer = require('multer');
var documentController = require('../controllers/document');
var auth = require('../auth');

var routes = function(app) {
  // Account
  app.use(multer({dest: 'uploads'})); // dest default: /tmp
  app.get('/files', auth.isAuthenticated, documentController.getDocuments);
  app.post('/files', auth.isAuthenticated, documentController.uploadDocument);
};

module.exports = routes;
