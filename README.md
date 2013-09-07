pins
====

Create Pinterest style pins for your own files over HTTP

![pins](http://www.daveeddy.com/static/media/github/pins.png)

*still in beta*

Installation
------------

    npm install -g pins

Example
-------

Navigate to a directory and run `pins` to fire up a webserver to view your files,
your default web browser will be opened automatically if possible

    dave @ [ manilla :: (Darwin) ] ~/Desktop $ pins
    [2013-09-07T21:17:22.986Z] server started: http://localhost:8087
    [2013-09-07T21:17:23.231Z] 127.0.0.1 GET 200 / (8ms)
    [2013-09-07T21:17:23.385Z] 127.0.0.1 GET 200 /background.png?private (105ms)
    [2013-09-07T21:17:24.039Z] 127.0.0.1 GET 200 /Screen%20Shot%202013-09-07%20at%205.16.00%20PM.png (764ms)

Usage
-----

    $ pins -h
    Usage: pins [-d dir] [-H host] [-p port] [-v] [-u] [-h]

    Options
      -d, --dir        the directory to serve out of, defaults to cwd
      -h, --help       print this message and exit
      -H, --host       the host on which to listen, defaults to localhost
      -p, --port       the port on which to listen, defaults to 8087
      -u, --updates    check for available updates
      -v, --version    print the version number and exit

Todo
----

- Order should be saved in a file like `.DS_Store`... `.pins.plist` maybe

Credit
------

- Style influenced by http://pinterest.com
- CSS adapted from http://cssdeck.com/labs/css-only-pinterest-style-columns-layout
- Background Patterns from http://subtlepatterns.com/

License
-------

MIT
