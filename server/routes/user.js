/**
 * User Routes
 */

'use strict';

var userController = require('../controllers/user');
var auth = require('../auth');

var routes = function(app) {

  app.get('/user', auth.isAuthenticated, userController.getProfile);

  // Create
  app.post('/user', userController.createAccount);

  // Update profile
  app.put('/user', auth.isAuthenticated, userController.updateProfile);
  app.patch('/user', auth.isAuthenticated, userController.updateProfile);

  // Update Password
  app.put('/user/password', auth.isAuthenticated, userController.updatePassword);

  // Delete
  app.delete('/user', auth.isAuthenticated, userController.deleteAccount);

};

module.exports = routes;
