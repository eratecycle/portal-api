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


function parsePage(pageText) {

}

exports.canProcessPage = canProcessPage;
exports.parsePage = parsePage;
