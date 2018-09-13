#!/usr/bin/env node
/**
 * Simple HTTP Server For Pinterest style pins
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: 9/6/2013
 * License: MIT
 */

var http = require('http');
var util = require('util');

var accesslog = require('access-log');
var easyreq = require('easyreq');
var open = require('open');
var getopt = require('posix-getopt');
var utils = require('./lib/utils');

var artroute = require('./routes/art');
var orderroute = require('./routes/order');

var _package = require('./package.json');

function usage() {
  return [
    'Usage: pins [-d dir] [-H host] [-p port] [-v] [-u] [-h]',
    '',
    'Options',
    '  -b, --buffer        buffer log output, defaults to ' + buffer,
    '  -d, --dir <dir>     the directory to serve out of, defaults to cwd',
    '  -h, --help          print this message and exit',
    '  -H, --host <host>   the host on which to listen, defaults to ' + host,
    '  -i, --index         show index.html/index.htm files if found, defaults to ' + index,
    '  -l, --limit <num>   max number of files to process in a directory, defaults to ' + limit,
    '  -n, --no-open       don\'t open the default browser upon starting',
    '  -p, --port <port>   the port on which to listen, defaults to ' + port,
    '  -u, --updates       check for available updates',
    '  -v, --version       print the version number and exit',
    '  -x, --no-reorder    disable persistent pin rearranging'
  ].join('\n');
}

var options = [
  'b(buffer)',
  'd:(dir)',
  'h(help)',
  'H:(host)',
  'i(index)',
  'l:(limit)',
  'n(no-open)',
  'p:(port)',
  'u(updates)',
  'v(version)',
  'x(no-reorder)'
  ].join('');
var parser = new getopt.BasicParser(options, process.argv);
var buffer = false;
var dir = process.cwd();
var host = 'localhost';
var index = false;
var limit = 5000;
var port = 8087;
var noopen = false;
var noreorder = false;
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'b': buffer = true; break;
    case 'd': dir = option.optarg; break;
    case 'h': console.log(usage()); process.exit(0);
    case 'H': host = option.optarg; break;
    case 'i': index = true; break;
    case 'l': limit = +option.optarg || limit; break;
    case 'n': noopen = true; break;
    case 'p': port = option.optarg; break;
    case 'r': port = option.optarg; break;
    case 'u': // check for updates
      require('latest').checkupdate(_package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': console.log(_package.version); process.exit(0);
    case 'x': noreorder = true; break;
    default: console.error(usage()); process.exit(1); break;
  }
}

process.chdir(dir);

var staticroute = require('./routes/static')(
  {
    autoindex: true,
    logger: function() {},
    limit: limit,
    tryfiles: index ? ['index.html', 'index.htm'] : []
  }
);

// start the server
http.createServer(onrequest).listen(port, host, listening);

function listening() {
  console.log('server started: http://%s:%d', host, port);
  if (!noopen)
    open(util.format('http://%s:%d', host, port));
  if (buffer) {
    // buffer the logs
    var logbuffer = require('log-buffer');
    logbuffer(8192);
    // flush every 5 seconds
    setInterval(logbuffer.flush.bind(logbuffer), 5 * 1000);
  }
}

function onrequest(req, res) {
  easyreq(req, res);
  accesslog(req, res);

  if (utils.hap(req.urlparsed.query, 'art')) {
    artroute(req, res);
  } else if (utils.hap(req.urlparsed.query, 'order') && req.method === 'POST') {
    if (noreorder) {
      res.error();
    } else {
      orderroute(req, res);
    }
  } else {
    staticroute(req, res);
  }
}
