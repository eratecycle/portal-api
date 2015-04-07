'use strict';

var passport = require('passport');
var secrets = require('../config/secrets');
var localStrategy = require('./strategies/local');
var basicStrategy = require('./strategies/basic');

/**
 * Initialize passport serialization/deserialization
 */
var init = function(User) {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // Setup Passport strategies
  localStrategy(User);
  basicStrategy(User);
};

/**
 * Check to see if user is authenticated
 */
var isAuthenticated = function(req, res, next) {
  if (req.accepts('json')) {
    return passport.authenticate('basic', { session : false })(req,res,next);
  }
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');

};

/**
 * Checks if the user role meets the minimum requirements of the route
 */
var hasRole = function(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  function meetsRequirements(req, res, next) {
    if (secrets.userRoles.indexOf(req.user.role) >= secrets.userRoles.indexOf(roleRequired)) {
      next();
    } else {
      if (req.accepts('json')) {
        var err = new Error();
        err.status = 401;
        next(err);
      } else {
        res.redirect('/login');
      }
    }
  }
  return meetsRequirements;
};

module.exports = {
  init: init,
  isAuthenticated: isAuthenticated,
  hasRole: hasRole,
};
