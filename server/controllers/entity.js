/**
* Entity Controller
*/

'use strict';
var request = require('request');
var cheerio = require('cheerio');

/**
* GET /entity/search
* Search for an entity
*/

var entitySearch = function(req, res, next) {
  var cookieJar = request.jar();
  var rootUrl = 'http://www.sl.universalservice.org/Utilities';

  if (!req.query || !req.query.zipCode) {
    res.statusCode = 404;
    return res.send();
  }
  request.get({
    url: rootUrl + '/BilledEntitySearch_Public.asp',
    jar: cookieJar
  }, function(err, resp, body){
    request.post({
      url:rootUrl + '/BilledEntityDisplay_Public.asp#sop',
      jar: cookieJar,
      form: {
        btnType: 'All+Entity+Types',
        txtEntityZip: req.query.zipCode,
        btnSearch: 'Search',
        hidSearchType: '4',
        hidZip: req.query.zipCode
      }
    }, function(err, resp, body){
      if (!err && resp.statusCode === 200) {
        var $ = cheerio.load(body);
        var $table = $('table').eq(6);
        var results = [];
        $table.children().each(function(idx, element){
          if (idx > 0) {
            var cols = $(this).children();
            results[idx-1] = {
              id: cols.eq(0).text().trim(),
              name: cols.eq(1).text().trim(),
              state: cols.eq(2).text().trim(),
              category: cols.eq(3).text().trim()
            };
          }
        });
        res.send(results);
      }
    });
  });
};


module.exports = {
  entitySearch: entitySearch
};
