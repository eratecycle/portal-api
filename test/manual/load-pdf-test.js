var parsePDFPath = require('../../server/helpers/verizon-parser');

parsePDFPath('/Users/jakemadden/workspace/eratecycle/portal-api/test/bills/verizon-EA/201404.pdf', function(err, data) {
  if (err) {
    console.log('error:'+err);
    return;
  }

});
