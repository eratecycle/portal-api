'use strict';

var config = require('../config/env/default');
var parsePDFStatement = require('../helpers/parser');

/**
 * GET /files
 * Get documents.
 */

var getDocuments = function(req, res) {
  res.send();
};

/**
 * POST /files
 * upload files
 */

var uploadDocument = function(req, res, next) {
  //console.log(req.files);

  var files = req.files;
  var user = req.user;
  console.log('user ' + user.email + ' sent files');
  if (Array.isArray(files)) {
      // response with multiple files (old form may send multiple files)
      console.log('Got ' + files.length + ' files');
  }
  else {
      // dropzone will send multiple requests per default
      files.file.dateAdded = new Date();
      console.log('Got one file ' + files.file.path);
      if (user.files) {
        user.files.push(files.file);
      } else {
        user.files = [files.file];
      }
      parsePDFStatement(files.file.path, function(err, results){
        if (user.transactions) {
          results.forEach(function(trans){
            user.transactions.push(trans);
          });
        } else {
          user.transactions = results;
        }
        user.save(function (err, user, numberAffected) {
          if (err) {
            res.status(500);
            res.send({msg: err});
          } else {
            res.send(files.file);
          }
        });
      });
  }
};

module.exports = {
  getDocuments: getDocuments,
  uploadDocument: uploadDocument,
};
