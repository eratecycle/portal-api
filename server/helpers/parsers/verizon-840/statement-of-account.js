var _          = require('highland');

function canProcessPage(pageText) {
  var statementOfAccount = 'Statement of Account';

  var startIndex = pageText.indexOf(statementOfAccount);
  if (startIndex > -1) {
    // console.info('found Statement of Account page!');
    return true;
  }
  return false;
}

function processSpacedLine(line) {
  var data = [];
  var values = line.split('$');
  var socTableLen = 5;
  if (values.length === socTableLen) {
    var rex = new RegExp('\\s*(.+)\\s\\s+([^\\s]+)');
    var potMatchArray = values[0].match(rex);
    if (potMatchArray) {
      data.push(potMatchArray[1]);
      data.push(potMatchArray[2].trim());
    }

    data.push(values[1].trim());

    rex = new RegExp('\\s*([^\\s]+)\\s\\s+(.+)');
    potMatchArray = values[2].match(rex);
    if (potMatchArray) {
      data.push(potMatchArray[1]);
      data.push(potMatchArray[2].trim());
    }

    data.push(values[3].trim());
    data.push(values[4].trim());

    return data;
  }
  return undefined;
}


function parsePage(pageText, billSummary) {
  var adjustments = {};
  var lines = pageText.split('\\n');
  lines.forEach(function(line) {
    var data = processSpacedLine(line);
    if (data) {
      adjustments[data[4]] = {
        date: data[0],
        referenceNumber: data[1],
        invoiceAmount: data[2],
        adjustments: data[3],
        payments: data[5],
        total: data[6]
      };
    }
  });
  // console.info(adjustments, null, 2);
  billSummary.adjustmentsSummary = adjustments;
}

exports.canProcessPage = canProcessPage;
exports.parsePage = parsePage;
