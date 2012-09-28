// lib/server/pages.js
//
// Collection of all the Page objects.
// API:
// - pages.getPage(docName)
// - pages.loadPage(docName)
// - pages.createPage(docName)
// - pages.servePage(path, req, res)
// - pages.sendPage(res, name)
// - pages.auth(address, docName)
// - pages.deauth(address, docName)
// - pages.isAuthed(address, docName)
//
// Author: Tim Coppieters
// Date: September 2011

define(['config', 'Page', 'jsdom', 'module', 'path', 'fs'], 
				function (config, Page, jsdom, module, path, fs) {

	// single instance object	
	var pages = new ((function() {
    // private
    var _pages = [];
    var _authed = {};

	 	//constructor	
		function pages() {
      // this must be executed before the server can actually start working
      // therefore readdirSync must be used.
      var pageNames = fs.readdirSync('public/html/');
      for(var i=0; i<pageNames.length; i++) {
        // index.html --> index
        var pageName = pageNames[i].slice(0, pageNames[i].length - 5);
        this.loadPage(pageName);
      }
        
    }

		// servePage: tries serving given path through the given response object.
    pages.prototype.servePage = function(path, req, res) {
      var name = getPageName(path);  
      var pgs = this;
      // if the request is of the type '<page>.admin' or '<page>.create then check the creds.
      if (isAdminRequest(path) || isCreateRequest(path)) {
        // if creds are incorrect return 401.
        if (!checkAuth(req)) {
          var body = "<html><head></head><body><h1>401 Unauthorized.</h1></body></html>";
          res.writeHead(401, {
            'WWW-Authenticate': "Basic realm=\"Secure Area\"",
            'Content-Type': 'text/html',
            'Content-Length': body.length });
         return res.end(body);
        }
        // otherwise auth the user for the given page
        this.auth(req.connection.remoteAddress, name);
      }
      // if request is of type <page>.create, make the new page
      if (isCreateRequest(path)) {
        console.log('creating ' + name);
        return this.createPage(name, function afterPageCreation(page) {
          pgs.sendPage(path, res, name);
        });
      }
      // if request is of type <page>.export, export the page
      if (isExportRequest(path)) {
        console.log('exporting ' + name);
        return this.getPage(name).export(function (buf) {
          res.setHeader('Content-Type', 'zip');
          res.setHeader('Content-disposition', 'attachment; filename=' + name + '.zip');
          res.end(buf, 'binary');
        });
      }
      // otherwise, send the page
      pgs.sendPage(path, res, name);
        
      
    };

    // sendPage: does the actual sending of the page through the given response object.
    pages.prototype.sendPage = function sendPage(path, res, name) {
      // serve the page
      console.log('serving ' + name);
      var page = this.getPage(name);
      if (page) {
        page.save();
        var html = isAdminRequest(path) ? page.toAdminHTML() : page.toHTML();
        res.writeHead(200);
        return res.end(html);
      }
      res.writeHead(404);
      res.end(config.pageNotFound);
    }

    // auth: auths given address for given page.
    // Authed addresses can be server admin pages.
    pages.prototype.auth = function auth(address, docName) {
      console.log(address + " is authed for " + docName);
      if (!_authed[docName])
        _authed[docName] = {};
      _authed[docName][address] = true;
    }; 

    // deauth: deauths given address for given page.
    pages.prototype.deauth = function deauth(address, docName) {
      console.log(address + " is deauthed for " + docName);
      delete _authed[docName][address];
    };

    // isAuthed: checks if given address is authed for given page.
    pages.prototype.isAuthed = function isAuthed(address, docName) {
      if (docName)
        return _authed[docName][address];
      for (var doc in _authed) {
        if (_authed[doc][address])
          return true;
      }
      return false;
    };
			
    // getPageName: extracts pageName from a path
    function getPageName(path) {
      if (path == '/')
        return "index";
      var name = path.split("/")[1];
      var splitDot = name.split(".");
      if (splitDot.length > 1)
        return splitDot[0];
      return name;
    }

    // isAdminRequest: checks if the given path is a an admin page request.
    // host.com/docName.admin
    function isAdminRequest(path) {
      var arr = path.slice(1).split(".");
      return (arr.length > 1) && (arr[1] == 'admin');
    }

    // isCreateRequest: checks if the given path is a create page request.
    // host.com/docName.create
    function isCreateRequest(path) {
      var arr = path.slice(1).split(".");
      return (arr.length > 1) && (arr[1] == 'create');
    }

    // isExportRequest: checks if the given path is an export request.
    // host.com/docName.export
    function isExportRequest(path) {
      var arr = path.slice(1).split(".");
      return (arr.length > 1) && (arr[1] == 'zip');
    }

    // checkAuth: checks if the given request object has the correct authentication
    // credentials.
    function checkAuth(req) {
      var header = req.headers['authorization'] || '';
      var token = header.split(/\s+/).pop() || '';
      var auth = new Buffer(token, 'base64').toString();
      var creds = auth.split(/:/);
      var username = creds[0];
      var password = creds[1];
      return (username == 'test' && password == 'test');
    }

		// createPage
		pages.prototype.createPage = function(name, callback) {
    	new Page(name, function (page) {
			  _pages[name] = page;
        _authed[name] = {};

        if (callback) callback(page);
      }, false);
    };

    // loadPage
    pages.prototype.loadPage = function (name, callback) {
      new Page(name, function (page) {
        _pages[name] = page;
        _authed[name] = {};

        if (callback) callback(page);
      }, true);
    };

		// getPage
		pages.prototype.getPage = function (name) {
			return _pages[name];
		};

		return pages;
  })());
	
	return pages;
});
