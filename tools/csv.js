var _ = require('lodash');
var csv = require('fast-csv');

module.exports.importFile = function(mongoose, filePath, csvMappings, cb) {
  var header = '';
  var occurrences = [];
  var pathSplit = filePath.split('/');
  var fileName = pathSplit[pathSplit.length-1];
  csv
    .fromPath(filePath)
    .on('data', function(data) {

      if (header.length === 0) {
        header = data;
        csvMappings.forEach(function(mapping) {
          var count = 0;
          var idx = _.findIndex(header, function(val) {
            if (val === mapping.col) {
              ++count;
              return mapping.occurrence ? (mapping.occurrence && count === mapping.occurrence) : true;
            }
            return false;
          });
          mapping.idx = idx;
        });
      }

      if (data[0] !== 'D') return;

      var Obj = mongoose.model('invoice');
      var obj = new Obj();

      csvMappings.forEach(function(mapping) {
        var val = data[mapping.idx];
        if (val !== '') {
          obj.set(mapping.prop, val);
        }
      });

      if (obj.get('service_code') && (obj.get('charge_amount')||obj.get('tax_amount'))) {
        obj.save(function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
    })
    .on('end', function() {
      var Bill = mongoose.model('bill');
      var bill = new Bill();
      bill.set('file_name', fileName);
      bill.save(function(){
        console.log(filePath + ' completed');
        cb();
      });
    });
}
