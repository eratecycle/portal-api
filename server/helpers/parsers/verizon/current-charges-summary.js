var _          = require('highland');
var accounting = require('accounting');

function canProcessPage(pageText) {
  var currentChargesSummary = 'Current Charges Summary';
  var currentChargesByAccount = 'Current Charges Summary by Account';

  var startIndex = pageText.indexOf(currentChargesSummary);
  if ((startIndex > -1) && (pageText.indexOf(currentChargesByAccount) === -1)) {
    // console.info('found current charges page!');
    return true;
  }
  return false;
}

function getChargesForService(lines, service) {
  // console.info('getChargesForService');
  var result = [];
  var dataServicesIndex = 0;
  var totalDataServicesIndex = 0;

  var findServiceLine = function(line){
    return line.indexOf(service) > -1;
  }

  var findTotalLine = function(line){
    return line.indexOf('Total ' + service) > -1;
  }

  _(lines).find(findServiceLine).apply(function(line){
    dataServicesIndex = lines.indexOf(line);
  });

  _(lines).find(findTotalLine).apply(function(line){
    totalDataServicesIndex = lines.indexOf(line);
  });

  for (var i = dataServicesIndex + 1; i < totalDataServicesIndex; i++ ) {
    var values = lines[i].split('$');
    result.push({
      description: values[0].trim(),
      total: accounting.unformat(values[values.length-1].trim())
    });
  }
  return result;
}

function parsePage(pageText, billSummary) {
  var serviceValues = ['Data Services', 'Additional Charges'];
  var charges = [];

  var lines = pageText.split('\\n');
  
  serviceValues.forEach(function(service) {
    charges.push(getChargesForService(lines, service));
  });

  _(charges).flatten().toArray(function(flatArray){
    charges = flatArray;
  });

  if (charges) {
    charges.forEach(function(charge){
      billSummary.transactions.push({
        date: billSummary.currentTransactionDate,
        description: charge.description,
        amount: charge.total
      });
    });
  }
}

exports.canProcessPage = canProcessPage;
exports.parsePage = parsePage;
