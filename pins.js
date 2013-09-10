#!/usr/bin/env node
/**
 * Simple HTTP Server For Pinterest style pins
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: 9/6/2013
 * License: MIT
 */

var fs = require('fs');
var http = require('http');
var util = require('util');

var accesslog = require('access-log');
var easyreq = require('easyreq');
var open = require('open');
var getopt = require('posix-getopt');

var staticroute = require('./routes/static')(
  {
    autoindex: true,
    logger: function() {}
  }
);
var artroute = require('./routes/art');
var orderroute = require('./routes/order');

var package = require('./package.json');

function usage() {
  return [
    'Usage: pins [-d dir] [-H host] [-p port] [-v] [-u] [-h]',
    '',
    'Options',
    '  -d, --dir           the directory to serve out of, defaults to cwd',
    '  -h, --help          print this message and exit',
    '  -H, --host          the host on which to listen, defaults to ' + host,
    '  -n, --no-open       don\'t open the default browser upon starting',
    '  -p, --port          the port on which to listen, defaults to ' + port,
    '  -u, --updates       check for available updates',
    '  -v, --version       print the version number and exit',
    '  -x, --no-reorder    disable persistent pin rearranging',
  ].join('\n');
}

var options = [
  'd:(dir)',
  'h(help)',
  'H:(host)',
  'n(no-open)',
  'p:(port)',
  'u(updates)',
  'v(version)',
  'x(no-reorder)',
  ].join('');
var parser = new getopt.BasicParser(options, process.argv);
var dir = process.cwd();
var host = 'localhost';
var port = 8087;
var noopen = false;
var noreorder = false;
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'd': dir = option.optarg; break;
    case 'h': console.log(usage()); process.exit(0);
    case 'H': host = option.optarg; break;
    case 'n': noopen = true; break;
    case 'p': port = option.optarg; break;
    case 'r': port = option.optarg; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': console.log(package.version); process.exit(0);
    case 'x': noreorder = true; break;
    default: console.error(usage()); process.exit(1); break;
  }
}
var args = process.argv.slice(parser.optind());

process.chdir(dir);

// start the server
http.createServer(onrequest).listen(port, host, listening);

function listening() {
  require('log-timestamp');
  console.log('server started: http://%s:%d', host, port);
  if (!noopen)
    open(util.format('http://%s:%d', host, port));
}

function onrequest(req, res) {
  easyreq(req, res);
  accesslog(req, res);
  if (req.urlparsed.query.hasOwnProperty('art'))
    artroute(req, res);

  else if (req.urlparsed.query.hasOwnProperty('order') && req.method === 'POST')
    if (noreorder)
      res.error();
    else
      orderroute(req, res);

  else
    staticroute(req, res);
}
