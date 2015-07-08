var _          = require('highland');

function canProcessPage(pageText) {
  var statementSummaryStr = 'Current Usage Charges';

  var startIndex = pageText.indexOf(statementSummaryStr);
  if (startIndex > -1) {
    // console.info('found Statement Summary!');
    return true;
  }
  return false;
}

function getColonData(line) {
  if (line.match(/FOR CUSTOMER SERVICE/)) {
    return undefined;
  }
  var rex = new RegExp('\\s*([^:]*):\\s\\s*([^\\s\\$]+)');
  var potMatchArray = line.match(rex);
  if (potMatchArray) {
    var result = [potMatchArray[1], potMatchArray[2]];
    return result;
  }
  return undefined;
}


function getSpacedCurrencyData(line) {
  var rex = new RegExp('\\s*([a-zA-Z][^\\$:]+)\\$([^\\s_]+)');
  var potMatchArray = line.match(rex);
  if (potMatchArray) {
    potMatchArray[1] = potMatchArray[1].replace(/\./g, '');
    potMatchArray[1] = potMatchArray[1].replace(/- Thank You/, '');
    if (/-$/.test(potMatchArray[1])) {
      potMatchArray[1] = potMatchArray[1].replace(/-/g, '');
      potMatchArray[2] = '-'+potMatchArray[2];
    }
    var result = [potMatchArray[1].trim(), potMatchArray[2]];
    return result;
  }
  return undefined;
}


function parsePage(pageText, billSummary) {

  var summary = {};
  
  var lines = pageText.split('\\n');
  lines.forEach(function(line) {
    var cData = getColonData(line);
    if (cData) {
      summary[cData[0]] = cData[1];
    }
    var sData = getSpacedCurrencyData(line);
    if (sData) {
      summary[sData[0]] = sData[1];
    }
  });

  billSummary.statementSummary = summary;

}

exports.canProcessPage = canProcessPage;
exports.parsePage = parsePage;
