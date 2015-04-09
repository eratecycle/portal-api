var config = require('../config/env/default');
var nodemailer = require('nodemailer');
var emailTemplates = require('email-templates');
var path = require('path');
var templatesDir = path.resolve(__dirname, '..', 'templates/mailer');

var sendMail = function (templateName, options, cb) {
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

module.exports = {
  sendMail: sendMail
}
