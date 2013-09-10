var path = require('path');

var getmetadata = require('../lib/metadata');

module.exports = artfunc;

function artfunc(req, res) {
  var reqfile = path.normalize(decodeURIComponent(req.urlparsed.pathname));
  var file = path.join(process.cwd(), reqfile);
  getmetadata(file, function(e, metadata) {
    if (e)
      return res.notfound();

    var pic = (metadata.picture || [])[0];
    if (!pic)
      return res.notfound();

    res.setHeader('Content-Type', 'image/' + (pic.format || 'xyz'));
    res.end(pic.data);
  });
}
