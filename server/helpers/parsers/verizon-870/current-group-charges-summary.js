var _          = require('highland');

function canProcessPage(pageText) {
  var indentifierString = 'Current Group Charges Summary';

  var startIndex = pageText.indexOf(indentifierString);
  if (startIndex > -1) {
    // console.info('found Current Group Charges Summary!');
    return true;
  }
  return false;
}

function processSpacedLine(line) {
  var data = [];
  var values = line.split('$');
  var socTableLen = 9;
  if (values.length === socTableLen) {
    values.forEach(function(value, index) {
      if (/-$/.test(value)) {
        values[index] = value.replace(/-/g, '').trim();
        values[index+1] = '-'+values[index+1];
      } else {
        values[index] = value.trim();
      }
    });

    return values;
  }
  return undefined;
}

function parsePage(pageText, billSummary) {

  var groupCharges = {};
  var lines = pageText.split('\\n');

  lines.forEach(function(line) {
    var data = processSpacedLine(line);
    if (data) {
      groupCharges[data[0]] = {
        usageCharges: data[1],
        recurringCharges: data[2],
        nonRecurringCharges: data[3],
        amount: data[4],
        discounts: data[5],
        subTotal: data[6],
        taxes: data[7],
        total: data[8]
      };
    }
  });

  billSummary.groupCharges = groupCharges;

}

exports.canProcessPage = canProcessPage;
exports.parsePage = parsePage;
