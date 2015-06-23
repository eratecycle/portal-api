var parsePDFPath = require('../../server/helpers/verizon-parser');

parsePDFPath(process.argv[2], function(err, data) {
  if (err) {
    console.log('error:'+err);
    return;
  }

});
