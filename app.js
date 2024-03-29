var define = require('requirejs');

define.config({
  baseUrl: __dirname,
	nodeRequire: require,
	paths: {
    Dobject: 'lib/env/Dobject',
    SynerJ: 'lib/env/SynerJ',
    eventHandlers: 'lib/env/eventHandlers'
  }
});

define(['http', 'lib/server/sox', 'url', 'lib/server/pages', 'node-static', 'lib/config'],
		function (http, sox, url, pages, static, config) {

// the http server
var app = http.createServer(mainHandler);
app.listen(config.port);

// create static server for public files
var file = new static.Server();

// request handling for the http server
function mainHandler(req, res) {
  var thePath = url.parse(req.url).pathname;
	// static handling
  req.addListener('end', function () {
    // static file request (html, css, js and library files)
    if (thePath.match(/public/i) || thePath.match(/client|shared/i)) {
      file.serve(req, res);
    }
    // page request
    else {
      return pages.servePage(thePath, req, res);
    }
  });
}

// initliaze the sockets on the http server
sox.init(app, pages);
});
