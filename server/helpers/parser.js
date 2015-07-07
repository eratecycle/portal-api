// TO-DO: doesn't get the year right when the statement covers two years e.g. the statement is dated January 2014 but contains transactions from December 2013

var _          = require('highland');
var fs         = require('fs');
var accounting = require('accounting');

// HACK few hacks to let PDF.js be loaded not as a module in global space.
global.window = global;
global.navigator = { userAgent: "node" };
global.PDFJS = {};
global.DOMParser = require('pdfjs-dist/build/pdf.combined').DOMParserMock;
// global.compatibility = require('pdfjs-dist/web/compatibility');

var parsers = [
  require('./parsers/verizon-840'),
  require('./parsers/verizon-870')
];

function getPage(pageNum, doc) {
  return doc.getPage(pageNum);
}

function getNumPages(doc) {
  var numPages = doc.numPages;
  console.info('# Document Loaded');
  console.info('Number of Pages: ' + numPages);
  console.info();
  return numPages;
}

function getTextContent(pageNum, page) {
  // console.info('# Page ' + pageNum);
  // var viewport = page.getViewport(1.0 /* scale */);
  // console.info('Size: ' + viewport.width + 'x' + viewport.height);
  // console.info();
  return page.getTextContent();
}

function formatContent(content, item, i) {
  //console.info(JSON.stringify(item));
  // add an appropriate whitespace character here if the next item is on the
  // same line and more than 5px to the right, or is on the next line
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
}

function processContent(pageNum, content) {
  // Content contains lots of information about the text layout and
  // styles, but we need only strings at the moment
  var strings = content.items.map(_.partial(formatContent, content));
  // console.log('## Text Content');
  var text = strings.join('');
  // console.log(text);
  return text;
}

function findParser(billSummary, text) {
  if (billSummary.parser === undefined) {
    _(parsers)
    .find(function(possibleParser){
      return possibleParser.canProcessBill(text);
    })
    .each(function(parser){
      billSummary.parser = parser;
    })
  }
  return text;
}

function processStatementPage(i, billSummary, text) {
  if (billSummary.parser) {
    return billSummary.parser.processStatementPage(i, billSummary, text);
  }
  return billSummary;
}

function processPages(doc) {
  var numPages = getNumPages(doc);
  var lastPromise = doc.getMetadata().then(_.partial(printMetadata, doc));

  var billSummary = {
    transactions: []
  };

  for (var i = 1; i <= numPages; i++) {
    lastPromise = lastPromise
    .then(_.partial(getPage, i, doc)) // returns page
    .then(_.partial(getTextContent, i)) // returns content
    .then(_.partial(processContent, i)) // returns text
    .then(_.partial(findParser, billSummary))
    .then(_.partial(processStatementPage, i, billSummary)); // returns transactions
  }

  return lastPromise;
}

function printMetadata(doc, data) {
  console.info('# Metadata Is Loaded');
  console.info('## Info');
  console.info(JSON.stringify(data.info, null, 2));
  console.info();
  if (data.metadata) {
    console.info('## Metadata');
    console.info(JSON.stringify(data.metadata.metadata, null, 2));
    console.info();
  }
  return doc;
}

function formatTransaction(transaction) {
  return transaction.date+' '+transaction.description+': '+transaction.amount;
}

function endDoc(callback, billSummary) {
  console.info('# End of Document');
  console.info('### Bill Summary ###');
  console.info(JSON.stringify(billSummary, null, 2));
  console.info('### Bill Summary ###');
  var transactionsList = billSummary.transactions.map(formatTransaction).join('\n');
  console.info(transactionsList);
  // console.log('Totals from statement: payments '+totalPaymentsFromStatement+', receipts '+totalReceiptsFromStatement);
  // console.log('Totals from transactions: payments '+totalPaymentsFromTransactions.toFixed(2)+', receipts '+totalReceiptsFromTransactions.toFixed(2));
  // var errorsInPayments = (billSummary.totalPaymentsFromTransactions-billSummary.totalPaymentsFromStatement).toFixed(2);
  // var errorsInReceipts = (billSummary.totalReceiptsFromTransactions-billSummary.totalReceiptsFromStatement).toFixed(2);
  // console.warn('Errors: payments '+errorsInPayments+', receipts '+errorsInReceipts);
  callback(null, billSummary.transactions);
}

/*
* Parse a PDF data stream for statement data
* Safe to use in a browser
*/
function parsePDFStatement(data, callback) {

  // Will use promises to load document, pages and misc data instead of callback
  PDFJS.getDocument(data)
  .then(processPages)
  .then(_.partial(endDoc, callback))
  .catch(function(e) {
    console.log(e.stack);
    callback(e);
  });
  // TODO: catch when parser not found

} // end of processPDFStatment()


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
  _(fs.createReadStream(pdfPath))
  .toArray(function(buffers) {
    parsePDFStatement(new Uint8Array( Buffer.concat(buffers) ), callback)
  });

}

module.exports = parsePDFPath;
