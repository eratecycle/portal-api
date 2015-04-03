/**
 * Index Controller
 */

'use strict';

var indexController = function(req, res) {
  res.render('index', {
    title: 'Home',
    env: process.env.NODE_ENV || 'development'
  });
};

module.exports = {
  index: indexController
};
