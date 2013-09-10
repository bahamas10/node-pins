var musicmetadata = require('musicmetadata');

module.exports = artfunc;

function artfunc(req, res) {
  var rs, parser;
  try {
    rs = fs.createReadStream(file);
    rs.on('error', res.error.bind(res));
    parser = new musicmetadata(rs);
    parser.on('metadata', onmetadata);
  } catch (e) {
    rs.destroy();
    console.error('error opening <%s> for metadata', file);
    console.error(e);
    res.error();
    return;
  }

  // music metadata callback
  function onmetadata(metadata) {
    rs.destroy();
    metadata.request = req.urlparsed.pathname;
    metadata.basename = path.basename(req.urlparsed.pathname);
    metadata.haspicture = Object.keys(metadata.picture).length ? true : false;

    // just send the tags, no picture
    if (tags) {
      delete metadata.picture;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(metadata));
      return;
    }

    // html info in ejs format
    if (info) {
      metadata.size = +size;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(ejs.render(infotemplate, metadata));
      return;
    }

    // send the art only if present
    if (art) {
      var pic;
      try {
        pic = metadata.picture[0];
        if (!pic) throw new Error('picture not present');
      } catch (e) {
        res.notfound();
        return;
      }
      res.setHeader('Content-Type', 'image/' + (pic.format || 'xyz'));
      res.end(pic.data);
    }
  }

  return;
}
}
