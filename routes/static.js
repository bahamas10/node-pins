/**
 * create a static route
 */
var fs = require('fs');
var path = require('path');
var url = require('url');

var ejs = require('ejs');
var mime = require('mime');

var templ = fs.readFileSync(path.join(__dirname, '..', 'templates', 'index.ejs'), 'utf-8');
var assetsdir = path.join(__dirname, '..', 'assets');

module.exports = main;

// end `res` with statusCode = `code`
function end(res, code) {
  res.statusCode = code;
  res.end();
}

// exported function to give a static route function
function main(opts) {
  opts = opts || {};
  if (typeof opts === 'string') {
    opts = { dir: opts };
  }
  opts.tryfiles = [''].concat((opts.tryfiles || []).reverse());

  var logger = opts.logger || console.error.bind(console);

  return staticroute;

  // static serving function
  function staticroute(req, res) {
    var tryfiles = opts.tryfiles.slice(0);

    // `npm install easyreq` to have req.urlparsed set
    var urlparsed = req.urlparsed || url.parse(req.url, true);

    // decode everything, substitute # but not /
    var reqfile = path.normalize(decodeURIComponent(urlparsed.pathname));

    // unsupported methods
    if (['HEAD', 'GET'].indexOf(req.method) === -1)
      return end(res, 501);

    var f = path.join((opts.dir || process.cwd()), reqfile);

    if (urlparsed.pathname.indexOf('/assets/') === 0 && urlparsed.query.hasOwnProperty('private')) {
      // private asset
      f = path.join(assetsdir, urlparsed.pathname.replace('/assets', ''));
    }

    tryfile();

    function tryfile() {
      var file = path.join(f, tryfiles.pop());
      // the user wants some actual data
      fs.stat(file, function(err, stats) {
        if (err) {
          logger(err.message);
          if (tryfiles.length) return tryfile();

          end(res, err.code === 'ENOENT' ? 404 : 500);
          return;
        }

        if (stats.isDirectory()) {
          // directory
          // forbidden
          if (!opts.autoindex) return end(res, 403);

          // show the dir
          fs.readdir(file, function(e, d) {
            if (e) {
              logger(e.message);
              end(res, 500);
              return;
            }
            d.sort();
            d = ['.', '..'].concat(d);
            res.setHeader('Content-Type', 'text/html; charset=utf-8');

            var data = {
              name: reqfile,
              basename: path.basename(reqfile),
              pins: [],
              directories: [],
              files: []
            };

            var i = 0;
            d.forEach(function(name) {
              var fullpath = path.join(file, name);
              var m = mime.lookup(fullpath);
              var o = {
                name: name,
                mime: m,
                url: path.join(urlparsed.pathname, encodeURIComponent(name))
              };
              fs.stat(fullpath, function(e_, s_) {
                if (e_)
                  data.files.push(o);
                else if (ispin(m))
                  data.pins.push(o);
                else if (s_.isDirectory())
                  data.directories.push(o);
                else
                  data.files.push(o);
                if (++i >= d.length)
                  done();
              });
            });
            function done() {
              data.pins.sort(datasort);
              data.directories.sort(datasort);
              data.files.sort(datasort);
              var html = ejs.render(templ, data);
              res.html(html);
            }
          });
        } else {
          // file
          var etag = '"' + stats.size + '-' + stats.mtime.getTime() + '"';
          res.setHeader('Last-Modified', stats.mtime.toUTCString());

          // check cache
          var range = req.headers.range;
          if (req.headers['if-none-match'] === etag) {
            end(res, 304);
          } else if (range) {
            var parts = range.replace(/bytes=/, '').split('-');
            var partialstart = parts[0];
            var partialend = parts[1];

            var startrange = parseInt(partialstart, 10);
            var endrange = partialend ? parseInt(partialend, 10) : stats.size - 1;
            if (!startrange)
              startrange = 0;
            if (!endrange)
              endrange = stats.size - 1;
            var chunksize = endrange - startrange + 1;

            res.statusCode = 206;
            res.setHeader('Content-Range', 'bytes ' + startrange + '-' + endrange + '/' + stats.size);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Content-Length', chunksize);
            res.setHeader('Content-Type', mime.lookup(file));
            res.setHeader('ETag', etag);
            if (req.method === 'HEAD') {
              res.end();
            } else {
              var rs = fs.createReadStream(file, {start: startrange, end: endrange});
              rs.pipe(res);
              res.on('close', rs.destroy.bind(rs));
            }
          } else {
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Content-Type', mime.lookup(file));
            res.setHeader('ETag', etag);
            if (req.method === 'HEAD') {
              res.end();
            } else {
              var rs = fs.createReadStream(file);
              rs.pipe(res);
              res.on('close', rs.destroy.bind(rs));
            }
          }
        }
      });
    }
  }
}

function datasort(a, b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

function ispin(m) {
  var pins = ['image', 'video', 'audio'];
  for (var i in pins)
    if (m.indexOf(pins[i]) > -1)
      return true;
  return false;
}
