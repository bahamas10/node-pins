var fs = require('fs');

var musicmetadata = require('musicmetadata');

module.exports = data;

function data(file, cb) {
  var rs, parser;
  try {
    rs = fs.createReadStream(file);
    rs.on('error', cb);
    parser = new musicmetadata(rs);
    parser.on('metadata', onmetadata);
  } catch (e) {
    cb(e);
    return;
  }

  // music metadata callback
  function onmetadata(metadata) {
    rs.destroy();
    metadata.picture = metadata.picture || [];
    cb(null, metadata);
  }
}
