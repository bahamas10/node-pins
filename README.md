pins
====

Create Pinterest style pins for your own files over HTTP

*still in beta*

Installation
------------

    npm install -g pins

Example
-------

Navigate to a directory and run `pins` to fire up a webserver to view your files

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

License
-------

MIT
