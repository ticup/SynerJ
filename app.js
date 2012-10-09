var define = require('requirejs');

define.config({
	baseUrl: 'lib',	
	nodeRequire: require,
	paths: {
  // shared env code
    sDobject: '../shared/Dobject',
    'sDobject.core': '../shared/Dobject.core',
    sSynerJ: '../shared/SynerJ',
    'sSynerJ.core': '../shared/SynerJ.core',
    sEventHandlers: '../shared/eventHandlers',
  // server env code
    Dobject: 'env/Dobject',
    'Dobject.core': 'env/Dobject.core',
    SynerJ: 'env/SynerJ',
    'SynerJ.core': 'env/SynerJ.core',
    eventHandlers: 'env/eventHandlers',
  // server managing/servering code
    pages: 'server/pages',
    scripts: 'server/scripts',
    Page: 'server/Page',
    sox: 'server/sox',
    Sockets: 'server/Sockets',
  // misc
    css: '../shared/css',
    sConfig: '../shared/config'
    }
});

define(['http', 'sox', 'url', 'pages', 'scripts', 'node-static', 'config'],
		function (http, sox, url, pages, scripts, static, config) {

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
  if (thePath.match(/public/i)) {
    file.serve(req, res);
  }
	// a script is requested
	else if (thePath.match(/client|shared/i)) {
    return scripts.serveScript(thePath, req, res);
	}
  // a page is requested
  else { 
    return pages.servePage(thePath, req, res);
	}
  });
}
    

// initliaze the sockets on the app
sox.init(app, pages);
});
