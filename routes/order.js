var fs = require('fs');
var path = require('path');

module.exports = order;

function order(req, res) {
  var f = path.join(process.cwd(), path.normalize(decodeURIComponent(req.urlparsed.pathname)), '.pins.json');
  var ws = fs.createWriteStream(f);

  req.pipe(ws);

  ws.on('close', function() {
    res.json({message: 'saved', status: 'ok'});
  });

  ws.on('error', function(err) {
    var code = 500;
    res.json({error: err.message, code: err.code}, code);
    ws.destroy();
  });
}
