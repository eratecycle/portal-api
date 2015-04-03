/**
* Main Controller
*/

'use strict';

var User = require('mongoose').model('user');

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
      res.status(400);
      return res.send(errors);
    } else {
      return res.redirect('/signup');
    }
  }

  var user = new User({
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
        res.status(400);
        return res.send({msg: 'Account already exists'});
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
        if (req.accepts('json')) {
          res.status(200);
          return res.send();
        } else {
          res.redirect('/');
        }
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
  createAccount: createAccount,
  updateProfile: updateProfile,
  updatePassword: updatePassword,
  deleteAccount: deleteAccount
};
