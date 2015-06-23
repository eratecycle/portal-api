/**
* Entity Controller
*/

'use strict';
var _ = require('lodash');
var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');

var rootUrl = 'http://www.sl.universalservice.org/Utilities/';

/**
* GET /entity/search
* Search for an entity
*/

var entitySearch = function(req, res, next) {
  var cookieJar = request.jar();

  if (!req.query || !req.query.zipCode) {
    res.statusCode = 404;
    return res.send();
  }
  request.get({
    url: rootUrl + 'BilledEntitySearch_Public.asp',
    jar: cookieJar
  }, function(err, resp, body){

    var zipCode = req.query.zipCode;

    request.post({
      url:rootUrl + 'BilledEntityDisplay_Public.asp#sop',
      jar: cookieJar,
      form: {
        btnType: 'All+Entity+Types',
        txtEntityZip: zipCode,
        btnSearch: 'Search',
        hidSearchType: '4',
        hidZip: zipCode
      }
    }, function(err, resp, body){
      if (!err && resp.statusCode === 200) {
        var $ = cheerio.load(body);
        var $table = $('table').eq(6);
        var results = [];

        /*
        parse table rows into entities
        */
        $table.children().each(function(idx, element){
          if (idx > 0) {
            var cols = $(this).children();
            results[idx-1] = {
              identifier: cols.eq(0).text().trim(),
              href: $(this).find('a').attr('href'),
              name: cols.eq(1).text().trim(),
              state: cols.eq(2).text().trim(),
              category: cols.eq(3).text().trim(),
              zipcode: zipCode
            };
          }
        });

        /*
        compare results with database cache
        */
        var Entity = mongoose.model('entity');
        Entity.find({zipcode: zipCode}, function(err, entities) {
          if (entities.length === results.length) {
            return res.send(entities);
          } else {
            results.forEach(function(result){
              /*
              check each result for database cache
              */
              if (!_.findWhere(entities, {identifier: result.identifier})) {
                /*
                save result in db cache
                */
                var entity = new Entity(result);
                entity.save(function(err, entity){
                  entities.push(entity);
                  /*
                  exit once the results match
                  */
                  if (entities.length === results.length) {
                    return res.send(results);
                  }
                });
              }
            });
          }
        });
      }
    });
  });
};


var entityDetails = function(req, res, next) {
  var cookieJar = request.jar();

  var Entity = mongoose.model('entity');
  Entity.find({identifier: req.params.id}, function(err, entities) {
    if (entities.length === 0) {
      res.statusCode = 404;
      return res.send();
    }
    request.get({
      url: rootUrl + entities[0].href,
      jar: cookieJar
    }, function(err, resp, body){
      var $ = cheerio.load(body);
      var $table = $('table').eq(2);
      var $tbody = $table.children().eq(0);
      var values = {
        street: $tbody.children().eq(3).children().eq(1).text().trim(),
        city: $tbody.children().eq(4).children().eq(1).text().trim()
      };

      Entity.findByIdAndUpdate(entities[0]._id, { $set: values}, function (err, entity) {
        res.send(entity);
      });
    });
  });
};

module.exports = {
  entitySearch: entitySearch,
  entityDetails: entityDetails
};
