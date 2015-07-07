var _          = require('highland');

function canProcessPage(pageText) {
  var statementSummaryStr = 'Statement Summary';

  var startIndex = pageText.indexOf(statementSummaryStr);
  if (startIndex > -1) {
    // console.info('found Statement Summary!');
    return true;
  }
  return false;
}

function getColonData(line) {
  var rex = new RegExp('\\s*([^:]*):\\s\\s*([^\\s]+)');
  var potMatchArray = line.match(rex);
  if (potMatchArray) {
    var result = [potMatchArray[1], potMatchArray[2]];
    return result;
  }
  return undefined;
}


function getSpacedCurrencyData(line) {
  var rex = new RegExp('\\s*([^\\$]+)\\$([^\\s_]+)');
  var potMatchArray = line.match(rex);
  if (potMatchArray) {
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
