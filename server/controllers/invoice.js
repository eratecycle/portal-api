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
        id: '$location_id',
        label:'$location_name'
      }
    }},
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
        id: '$service_code',
        label:'$service_type'
      }
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
    'location_id': req.query.group,
    'charge_type': 'Monthly Charges'
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
    'service_code': req.query.code,
    'charge_type': 'Monthly Charges'
  };

  if (req.query.group) {
    match['location_id'] = req.query.groups
  }

  Invoice.aggregate([
    { $match: match},
    { $group : {
        _id : {
          rate: '$charge_amount',
          rate_type: '$charge_type'
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
    }},
    { $sort: {
      '_id.date':1
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
