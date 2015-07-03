var _          = require('highland');

var currentChargesSummary = require('./verizon/current-charges-summary');
var statementOfAccount    = require('./verizon/statement-of-account');

var processors = [currentChargesSummary, statementOfAccount];

// takes in the first page of text and returns whether it can process this bill
function canProcessBill(pageText) {
  var index = pageText.indexOf('Verizon');
  if (index === 4) {
    return true;
  }
  return false;
}

function getStatementDate(pageText) {
  var statementSummary = 'Statement Summary';
  var statementDate;
  var index = pageText.indexOf(statementSummary);
  if (index > -1) {
    // found the Statement Summary page
    var invoiceDateCriteria = function(line){
      return line.indexOf('Invoice Date:') > -1;
    }
    var lines = pageText.split('\\n');
    _(lines).find(invoiceDateCriteria).apply(function(line){
      // found the Invoice Date line
      statementDate = line.split(':')[1].trim();
    });
  }
  return statementDate;
}

function processStatementPage(pageNum, billSummary, pageText) {
  // console.info('processStatementPage page:'+pageNum);

  if (billSummary.currentTransactionDate === undefined) {
    billSummary.currentTransactionDate = getStatementDate(pageText);
  }

  processors.forEach(function(processor) {
    if (processor.canProcessPage(pageText)) {
      processor.parsePage(pageText, billSummary);
    }
  });

  return billSummary;
}

exports.canProcessBill = canProcessBill;
exports.processStatementPage = processStatementPage;
