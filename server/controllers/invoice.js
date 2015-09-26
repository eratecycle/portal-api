/**
* Main Controller
*/

'use strict';
var _ = require('lodash');

var Invoice = require('mongoose').model('invoice');

/**
* GET /invoice/locations
* Get get a list of unique locations from invoice detail
*/
var getLocations = function(req, res, next) {
  Invoice.aggregate([
    { $group: {
      _id: {
        id: '$GROUP NUMBER',
        label:'$GROUP LABEL'
      }
    }},
    {
      $match: {
        '_id.id': { $gte: 0 } }
    },
    {
      $sort:{
        '_id.label':1
      }
    }
  ], function(err, result) {
    if (err) {
      return next(err);
    }
    res.send(_.pluck(result,'_id'));
  });
};

// Load a list of service types sorted by name
var getServices = function(req, res, next) {
  Invoice.aggregate([
    { $group: {
      _id: {
        id: '$SERVICE TYPE CODE',
        label:'$SERVICE TYPE'
      }
    }},
    { $match: {
        '_id.id': { $gte: 0 }
    }},
    { $sort: {
      '_id.label':1
    }}
  ], function(err, result) {
    if (err) {
      return next(err);
    }
    res.send(_.pluck(result,'_id'));
  });
};

// List each monthly charge for the given location
var getCharges = function(req, res, next) {
  Invoice.find({
    'Sum/Det IND':'D',
    'GROUP NUMBER': parseInt(req.query.group),
    'SERVICE DESCRIPTIONb': 'Monthly Charges'
  }, function(err, result) {
    if (err) {
      return next(err);
    }
    res.send(result);
  });
};

// Produces a count of each unique charge for a given service
var getServiceRates = function(req, res, next) {
  var match = {
    'Sum/Det IND':'D',
    'SERVICE TYPE CODE': parseInt(req.query.code),
    'SERVICE DESCRIPTIONb': 'Monthly Charges'
  };

  if (req.query.group) {
    match['GROUP NUMBER'] = parseInt(req.query.group)
  }

  Invoice.aggregate([
    { $match: match},
    { $group : {
        _id : {
          rate: '$PREDISCOUNTED CHARGEb',
          rate_type: '$SERVICE DESCRIPTIONb'
        },
        count : {$sum : 1}
    }}
  ], function(err, result) {
    if (err) {
      return next(err);
    }
    var result = result.map(function(rate) {
      return {
        rate_type: rate._id.rate_type,
        rate: rate._id.rate,
        count: rate.count
      }
    });
    res.send(result);
  });
};

var getMonthlyTotalsByService = function(req, res, next) {
  Invoice.aggregate([
    {$match: {
      charge_type: {$in:['Monthly Charges','Line Charge','Plan Minutes']}
    }},
    {$group : {
      _id : {date: '$invoice_date', charge_type: '$charge_type', service_type: '$service_type'},
      sum : {$sum : '$charge_amount'}
    }}
  ], function(err, result) {
    if (err) {
      return next(err);
    }
    var results = result.map(function(item) {
      var result = item._id;
      result.sum = Number((item.sum/100).toFixed(2));
      return result;
    });
    res.send(results);
  });
};

module.exports = {
  getLocations: getLocations,
  getCharges: getCharges,
  getServices: getServices,
  getServiceRates: getServiceRates,
  getMonthlyTotalsByService: getMonthlyTotalsByService
};
