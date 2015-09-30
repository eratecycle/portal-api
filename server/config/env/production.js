/**
 * Production Configuration
 */
'use strict';

// Production specific configuration
var prodConfig = {
  logLevel: 'short',
  siteURL: 'http://www.eratecycle.com',
  database: {
    // URL to connect to database
    url: process.env.MONGOLAB_URI || 'mongodb://heroku_app35708352:90o2mdckes3me8ilkq09lo04kg@ds061691.mongolab.com:61691/heroku_app35708352?replicaSet=rs-ds061691',
    // Mongoose database options
    options: {
      server: {
        socketOptions: {
          // Keep connection alive while server is running
          keepAlive: 1
        }
      },
      // Attempt to reconnect if connection is lost
      auto_reconnect: true
    }
  }
};

module.exports = prodConfig;
