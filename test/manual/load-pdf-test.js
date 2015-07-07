var parsePDFPath = require('../../server/helpers/parser');

parsePDFPath(process.argv[2], function(err, data) {
  if (err) {
    console.log('error:'+err);
    return;
  }

});
