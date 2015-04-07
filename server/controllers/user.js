/**
* Main Controller
*/

'use strict';

var User = require('mongoose').model('user');
var config = require('../config/env/default');
var nodemailer = require('nodemailer');
var emailTemplates = require('email-templates');
var path = require('path');
var templatesDir = path.resolve(__dirname, '..', 'templates/mailer');

var createError = function(msg) {
  var err = new Error();
  err.status = 400;
  err.message = msg;
  return err;
}

/**
* GET /user
* Get profile information.
*/

var getProfile = function(req, res, next) {
  User.findById(req.user._id, function(err, user) {
    if (err) {
      return next(err);
    }

    res.send(user);
  });
};


/**
* POST /user
* Create a new local account.
* @param email
* @param password
* @param confirmPassword
*/

var createAccount = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('organization', 'Organization name is required').len(3);
  req.assert('password', 'Password must be at least 6 characters long').len(6);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    if (req.accepts('json')) {
      return next(createError(errors));
    } else {
      return res.redirect('/signup');
    }
  }

  var user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    organization: req.body.organization,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({
    email: req.body.email
  }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', {
        msg: 'Account with that email address already exists.'
      });
      if (req.accepts('json')) {
        return next(createError('Account already exists'));
      } else {
        return res.redirect('/signup');
      }
    }
    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        sendWelcomeEmail('welcome', {
          email: user.email,
          subject: 'Welcome to E-Rate Cycle'
        }, function(err, responseStatus, html){
          if (err) {
            return next(err);
          }
          req.flash('success', {
            msg: 'Account created successfully.'
          });
          if (req.accepts('json')) {
            res.send(user);
          } else {
            res.redirect('/');
          }
        });
      });
    });
  });
};

var sendWelcomeEmail = function (templateName, options, cb) {
  // make sure that we have an user email
  if (!options.email) {
    return cb(new Error('email address required'));
  }
  // make sure that we have a message
  if (!options.subject) {
    return cb(new Error('subject required'));
  }
  emailTemplates(templatesDir, function (err, template) {
    if (err) {
      //console.log(err);
      return cb(err);
    }
    // Send a single email
    template(templateName, options, function (err, html) {
      if (err) {
        console.log(err);
        return cb(err);
      }
      // Setup email transport
      var transport = nodemailer.createTransport(config.mailer.serviceConfig);
      transport.sendMail({
        from: config.mailer.defaultEmailAddress,
        to: options.email,
        subject: options.subject,
        html: html,
        // generateTextFromHTML: true
      }, function (err, info) {
        if (err) {
          console.log('send error: ' + JSON.stringify(err))
          return cb(err);
        }
        console.log('sendMail completed: ' + info.response);
        return cb(null, info.response, html);
      });
    });
  });
};

/**
* PUT /user
* Update profile information.
*/

var updateProfile = function(req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/settings');
  }

  User.findById(req.user._id, function(err, user) {
    if (err) {
      return next(err);
    }

    user.email = req.body.email || '';
    user.firstName = req.body.firstName || '';
    user.lastName = req.body.lastName || '';

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', {
        msg: 'Profile information updated.'
      });
      res.redirect('/settings');
    });
  });
};

/**
* PUT /user/password
* Update current password.
* @param password
* @param confirmPassword
*/

var updatePassword = function(req, res, next) {
  req.assert('password', 'Password must be at least 6 characters long').len(6);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/settings');
  }

  User.findById(req.user._id, function(err, user) {
    if (err) {
      return next(err);
    }

    user.password = req.body.password;

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', {
        msg: 'Password has been changed.'
      });
      res.redirect('/settings');
    });
  });
};

/**
* DELETE /user
* Delete current user account.
*/

var deleteAccount = function(req, res, next) {
  User.findByIdAndRemove(req.user._id, function(err) {
    if (err) {
      return next(err);
    }
    req.logout();
    req.flash('info', {
      msg: 'Your account has been deleted.'
    });
    res.redirect('/');
  });
};

module.exports = {
  getProfile: getProfile,
  createAccount: createAccount,
  updateProfile: updateProfile,
  updatePassword: updatePassword,
  deleteAccount: deleteAccount
};
