var _          = require('highland');

var processors = [
  require('./verizon-870/statement-summary')
];

// takes in the first page of text and returns whether it can process this bill
function canProcessBill(pageText) {
  var index = pageText.indexOf('500 TECHNOLOGY DR., STE 870');
  if (index === 2) {
    console.info('Using Verizon-870 for bill processing...');
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

  _(processors)
  .filter(function(processor){
    return processor.canProcessPage(pageText);
  })
  .each(function(processor){
    processor.parsePage(pageText, billSummary)
  });

  return billSummary;
}

exports.canProcessBill = canProcessBill;
exports.processStatementPage = processStatementPage;
