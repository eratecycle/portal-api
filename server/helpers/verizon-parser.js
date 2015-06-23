// Requires single file built version of PDF.js -- please run
// `node make singlefile` before running the example.
//

// TO-DO: doesn't get the year right when the statement covers two years e.g. the statement is dated January 2014 but contains transactions from December 2013

var _          = require('lodash');
var fs         = require('fs');
var accounting = require('accounting');

var BillTypes  = require('./bill-types').BillTypes;

var hj         = require('highland');

// HACK few hacks to let PDF.js be loaded not as a module in global space.
global.window = global;
global.navigator = { userAgent: "node" };
global.PDFJS = {};
global.DOMParser = require('pdfjs-dist/build/pdf.combined').DOMParserMock;

/*
* Parse a PDF data stream for statement data
* Safe to use in a browser
*/
function parsePDFStatement(data, fileName, callback) {

  // reset global variable each time
  var totalPaymentsFromStatement = 0;
  totalPaymentsFromTransactions = 0;
  totalReceiptsFromStatement = 0;
  totalReceiptsFromTransactions = 0;
  transactions = [];
  currentTransactionDate = '';

  // Will be using promises to load document, pages and misc data instead of
  // callback.
  PDFJS.getDocument(data).then(function (doc) {

    var numPages = doc.numPages;
    console.info('# Document Loaded');
    console.info('Number of Pages: ' + numPages);
    console.info();

    var lastPromise; // will be used to chain promises
    lastPromise = doc.getMetadata().then(function (data) {
      console.info('# Metadata Is Loaded');
      console.info('## Info');
      console.info(JSON.stringify(data.info, null, 2));
      console.info();
      if (data.metadata) {
        console.info('## Metadata');
        console.info(JSON.stringify(data.metadata.metadata, null, 2));
        console.info();
      }
    });

    var loadPage = function (pageNum) {
      return doc.getPage(pageNum).then(function (page) {
        // console.info('# Page ' + pageNum);
        var viewport = page.getViewport(1.0 /* scale */);
        // console.info('Size: ' + viewport.width + 'x' + viewport.height);
        // console.info();
        return page.getTextContent().then(function (content) {
          // Content contains lots of information about the text layout and
          // styles, but we need only strings at the moment
          var strings = content.items.map(function (item, i) {
            //console.info(JSON.stringify(item));
            // add an appropriate whitespace character here if the next item is on the same line and more than 5px to the right, or is on the next line
            // item.transform[4] is the x coordinate
            // item.transform[5] is the y coordinate
            var nextItem = content.items[i+1];
            var padding = '';
            if(nextItem) {
              var isOnSameLine = nextItem.transform[5] === item.transform[5]; // transform[5] is y coordinate
              var isFarAway = nextItem.transform[4] - (item.transform[4] + item.width) > 5; // transform[4] is x coordinate
              //console.info('distance to next item', nextItem.transform[4] - item.transform[4],item.str,nextItem.str);
              if(!isOnSameLine) {
                padding = '\\n';
              }
              if(isFarAway) {
                padding = '\t';
              }
            }
            return item.str+padding;
          });
          // console.log('## Text Content');
          var text = strings.join('');
          // console.log(text);
          if (pageNum === 1) {
            var billType = identifyBill(text);
            // console.log('bill identified as: '+billType);
          }
          processStatementPage(text, pageNum);
          // console.info('# Transactions analysed');
        }).then(function () {
          // console.info();
        });
      });
    };
    // Loading of the first page will wait on metadata and subsequent loadings
    // will wait on the previous pages.
    for (var i = 1; i <= numPages; i++) {
      lastPromise = lastPromise.then(loadPage.bind(null, i));
    }
    return lastPromise;
  }).then(function () {
    console.info('# End of Document');
    var transactionsList = transactions.map(function(transaction) { return transaction.date+'\t'+transaction.description+'\t'+transaction.amount; }).join('\n');
    console.info(transactionsList);
    // console.log('Totals from statement: payments '+totalPaymentsFromStatement+', receipts '+totalReceiptsFromStatement);
    // console.log('Totals from transactions: payments '+totalPaymentsFromTransactions.toFixed(2)+', receipts '+totalReceiptsFromTransactions.toFixed(2));
    var errorsInPayments = (totalPaymentsFromTransactions-totalPaymentsFromStatement).toFixed(2),
    errorsInReceipts = (totalReceiptsFromTransactions-totalReceiptsFromStatement).toFixed(2);
    console.warn('Errors: payments '+errorsInPayments+', receipts '+errorsInReceipts);
    callback(null, transactions);
  }, function (err) {
    console.error('Error: ' + err);
    callback(err);
  });

} // end of processPDFStatment()

// process the first page of the bill to identify the billType
function identifyBill(text) {
  var index = text.indexOf('Verizon');
  if (index === 4) {
    // console.log('Verizon bill');
    return BillTypes.verizon1;
  }
  return -1;
}

function getChargesForService(lines, service) {
  // console.log('getChargesForService');
  var result = [];
  var dataServicesLine = _.findIndex(lines,function(line){
    return line.indexOf(service) > -1;
  });
  var totalDataServicesLine = _.findIndex(lines,function(line){
    return line.indexOf('Total ' + service) > -1;
  });
  for (var i = dataServicesLine + 1; i < totalDataServicesLine; i++ ) {
    var values = lines[i].split('$');
    result.push({
      description: values[0].trim(),
      total: accounting.unformat(values[values.length-1].trim())
    });
  }
  return result;
}

function getCharges(text, lines) {
  var currentChargesSummary = 'Current Charges Summary';
  var currentChargesByAccount = 'Current Charges Summary by Account';
  var serviceValues = ['Data Services', 'Additional Charges'];

  // console.log('getCharges');
  var results = [];
  var startIndex = text.indexOf(currentChargesSummary);
  if ((startIndex > -1) && (text.indexOf(currentChargesByAccount) === -1)) {
    // console.log('found current charges page!');
    serviceValues.forEach(function(service){
      results.push(getChargesForService(lines,service));
    });
    return _.flatten(results);
  }
}

function getStatementDate(text, lines) {
  var statementSummary = 'Statement Summary';
  // console.log('getStatementDate');
  var index = text.indexOf(statementSummary);
  if (index > -1) {
    var dateLine = _.findIndex(lines, function(line){
      return line.indexOf('Invoice Date:') > -1;
    });
    return lines[dateLine].split(':')[1].trim();
  }
}

function processStatementPage(text, pageNum) {
  var lines = text.split('\\n');
  // console.log('processStatementPage page:'+pageNum);
  // console.log('line count: ' + lines.length);

  var statementDate = getStatementDate(text, lines);
  if (statementDate) {
    // console.log('statementDate found: '+statementDate);
    currentTransactionDate = statementDate;
  }
  var charges = getCharges(text, lines);
  if (charges) {
    charges.forEach(function(charge){
      transactions.push({
        date: currentTransactionDate,
        description: charge.description,
        amount: charge.total
      });
    });
  }
}

/*
* Parse a PDF statement given its file path
* Only works under node
*/
function parsePDFPath(pdfPath, callback) {
  if(!pdfPath) {
    throw new Error('parsePDFStatement requires a pdfPath argument');
  }

  // console.log('# Starting '+pdfPath);

  // Loading file from file system into typed array
  fs.readFile(pdfPath, function(err, data){
    if (err) {
      return callback(err);
    }
    parsePDFStatement(new Uint8Array(data), pdfPath, callback);
  });

}

module.exports = parsePDFPath;
