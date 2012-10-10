// lib/server/Page.js
//
// Represents a serveable and persistent environment.
// API:
// - page = new Page(pageNam, callback, exists)
// - page.save()
// - page.toHTML()
// - page.toCSS()
// - page.toJs()
// - page.toServerJs()
//
// Author: Tim Coppieters
// Date: September 2011

define(['jsdom', 'fs', 'module', 'path', 'Dobject', 'SynerJ', 'cssom',
  'lib/config', 'lib/server/sox', 'jquery', 'node-zip'],
  function (jsdom, fs, module, path, Dobject, SynerJ, cssom, config, sox, jQuery, Zip) {
   jsdom.defaultDocumentFeatures = {
    FetchExternalResources   : ['css', 'script'],
    ProcessExternalResources : ['css', 'script']
  };
  
  var Page = (function () {

    // constructor
    function Page (pageNam, callback, exists) {
      var newPage = this;
      // a Page can either be created from an existing page on disk
      // or as a totally new one.
      if (!exists)
        initNewPage.call(newPage, pageNam, callback);
      else
        initFromExisting.call(newPage, pageNam, callback);
    }

    // initNewPage: the page does not it exist yet, so a new one has to
    // be created and the persistent storage need te set up.
    function initNewPage(pageNam, callback) {
      // create the DOM tree
      var deft = fs.readFileSync("public/html/default.html", 'utf-8');
      this.document = jsdom.jsdom(deft);

      // set title
      this.name = this.document.title = pageNam;
      this.window = this.document.createWindow();
      
      // add jquery to the window
      jQuery.create(this.window);
      
      // init SynerJ on the window
      var aSynerJ = new SynerJ(this.window);
      this.window.SynerJ = aSynerJ;
      
      // install css tag
      installStyleSheets(this);
      
      // save to disk
      this.save();

      // create a sockets collection for this page.
      // All the clients connected to this environment will be in this collection.
      // This is used by the sync function of the SynerJ object.
      aSynerJ.sockets = sox.createSockets(pageNam, this);

      // trigger callback
      if (callback) callback(this);

    }

    // initFromExisting: the page does already exist on disk, so it has to
    // be reconstructed in memory using that data.
    function initFromExisting(pageNam, callback) {
      // create the DOM tree
      var html = fs.readFileSync("public/html/" + pageNam + ".html", 'utf-8');
      //html = cleanUpData(html.toString());
      this.document = jsdom.jsdom(html);
      
      // set title
      this.name = this.document.title = pageNam;
      this.window = this.document.createWindow();
      
      // add jquery to the window
      jQuery.create(this.window);
      
      // init SynerJ on the window
      var aSynerJ = new SynerJ(this.window);
      this.window.SynerJ = aSynerJ;
      
      // load css and scripts
      loadStyleSheets(this);
      loadScripts(this);

      // create a socket which can be used to emit events
      // just like a client would've emitted them to the server.
      aSynerJ.sockets = sox.createSockets(pageNam, this);

      // trigger callback
      if (callback) callback(this);
    }
    
    // this is used to cleanup old environments that used to use data- attributes
    // to save properties.
    function cleanUpData(text) {
      return text.replace(/data-\w+=".*?"/g, "");
    }

    // loadStyleSheets: styleSheets aren't implemented in jsdom
		// so we add them manually. If we change a style it will not
		// change the related DOM elements, but that's not important.
		function loadStyleSheets(page) {
			var document = page.document;
      var $ = page.window.jQuery;
      document.styleSheets = [];
      // set styleSheets
      var def = fs.readFileSync('public/css/default.css');
      var objCss = fs.readFileSync('public/css/' + page.name + '.css');
      document.styleSheets[0] = cssom.parse(String(def));
      document.styleSheets[1] = cssom.parse(String(objCss));
    }
    
		// installStyleSheets: styleSheets aren't implemented in jsdom
		// so we add them manually. If we change a style it will not
		// change the related DOM elements, but that's not important.
		function installStyleSheets(page) {
			var document = page.document;
      var $ = page.window.jQuery;
      document.styleSheets = [];
      // install css tag
      var src = "public/css/" + page.name + ".css";
      var css = $("<link rel=stylesheet type=text/css href=" + src + "></link>");
      document.getElementsByTagName('head')[0].appendChild(css[0]);
      var def = fs.readFileSync('public/css/default.css');
      document.styleSheets[0] = cssom.parse(String(def));
      document.styleSheets[1] = cssom.parse("Dobject-0 { }");
    }
    
    // loadScripts: loads the necessary scripts into the page.
    // Loads the script that adds all the properties to the Dobjects.
    function loadScripts(page) {
      var SynerJ = page.window.SynerJ;
      fs.readFile('public/js/' + page.name + '.s.js', function (err, data) {
        if (!err) {
          eval(data.toString());
        }
      });
    }

    // saves the page to disk: html, css and js.
    Page.prototype.save = function (callback) {
      var html = this.toHTML();
      var js = this.toJS();
      var jss = this.toServerJS();
      var css = this.toCSS();
      var name = this.name;
      var count = 4;

      function callbackTracker() {
        count--;
        if (count === 0)
          if (callback) callback();
      }

      fs.unlink('public/html/' + name + '.html', function (err) {
        fs.writeFile('public/html/' + name + '.html', html, function (err) {
          if (err) throw err;
          callbackTracker();
        });
      });
      fs.unlink('public/js/' + name + '.s.js', function (err) {
        fs.writeFile('public/js/' + name + '.s.js', jss, function (err) {
          if (err) throw err;
          callbackTracker();
        });
      });
      fs.unlink('public/js/' + name + '.js', function (err) {
        fs.writeFile('public/js/' + name + '.js', js, function (err) {
          if (err) throw err;
          callbackTracker();
        });
      });
      fs.unlink('public/css/' + name + '.css', function (err) {
        fs.writeFile('public/css/' + name + '.css', css, function (err) {
          if (err) throw err;
          callbackTracker();
        });
      });
    };

    // toHTML
    Page.prototype.toHTML = function () {
      return this.document.outerHTML;
    };

    // toAdminHTML
    Page.prototype.toAdminHTML = function () {
      var html = this.toHTML();
      return html.replace('<script data-main="client/main" src="public/libs/require.js"></script>',
        '<script data-main="client/main-admin" src="public/libs/require.js"></script>');
    };

    // toExportHTML
    Page.prototype.toExportHTML = function () {
      var html = this.toHTML();
      return html.replace('<script data-main="client/main" src="public/libs/require.js"></script>',
        '<script data-main="js/main" src="js/require.js"></script>')
          .replace('<link rel="stylesheet" type="text/css" href="public/css/default.css" />',
                '<link rel="stylesheet" type="text/css" href="css/default.css" />')
          .replace('<link rel="stylesheet" type="text/css" href="public/css/' + this.name + '.css" />',
                '<link rel="stylesheet" type="text/css" href="css/' + this.name + '.css" />');
    };
    
    // toCSS
    Page.prototype.toCSS = function () {
      var css = this.window.document.styleSheets[1].toString();
      return css;
    };

    // toJS
    Page.prototype.toJS = function () {
      var SynerJ = this.window.SynerJ;
      var dobjects = SynerJ('SynerJ-Objects');
      var js = "require(['SynerJ'], function (SynerJ) {\n";
      js += this.toServerJS();
      js += "});";
      return js;
    };


    // toServerJS
    Page.prototype.toServerJS = function () {
      var SynerJ = this.window.SynerJ;
      var dobjects = SynerJ('SynerJ-Objects');
      var js = "";
      function setHandlers(obj) {
        var id = obj.id();
        var handlers = SynerJ._getHandlers(id);
        for (var name in handlers) {
          var handler = handlers[name];
          js += "SynerJ('" + id + "')._bind('" + name + "', '" + handler + "');\n";
        }
      }
      function setData(obj) {
        var id = obj.id();
        var data = obj.getProp();
        for (var name in data) {
          var val = data[name];
          if (typeof val != 'undefined'  && !(typeof val == 'object' && ! (Dobject.instanceOf(val)))) {
            // note: this is to cleanup old code from old envs, someday this can be removed
            if (val != '[object Object]') {
              if (typeof val == 'function' || typeof val == 'string')
                val = SynerJ._getFunctionString(obj, name);
              if (typeof val == 'object')
                val = val.toString();
              if (typeof val == 'string')
                val = "'" + val + "'";
              js += "SynerJ('" + id + "')._setProp('" + name + "', " + val + ");\n";
            }
          }
        }
      }
      SynerJ._treeWalk(dobjects, setHandlers);
      SynerJ._treeWalk(dobjects, setData);
      return js;
    };

    // toExportJS
    Page.prototype.toExportJS = function () {
      var SynerJ = this.window.SynerJ;
      var parent = SynerJ(config.objectsParent);
      var js = "require(['SynerJ'], function (SynerJ) {\n";
      // set properties
      SynerJ._treeWalk(parent, function (obj) {
        var id = obj.id();
        var data = obj._getProp();
        for (var name in data) {
          var val = data[name];
          if (typeof val == 'object')
            val = val.toString();
          if (typeof val == 'string')
            val = "'" + val + "'";
          js += "SynerJ('" + id + "').setProp('" + name + "', " + val + ");\n";
        }
      });
      // set handlers
      SynerJ._treeWalk(parent, function (obj) {
        var id = obj.id();
        var handlers = obj._getHandlers();
        for (var event in handlers) {
          js += "SynerJ('" + id + "').bind('" + event + "', " + handlers[event] + ");\n";
        }
      });

      js += "});";
      return js;
    };

    // the buffer given to the callback needs to be written away in binary!
    Page.prototype.export = function (callback) {
      var zip = new Zip();
      var name = this.name;
      var data = this.toExportJS();
      var html = this.toExportHTML();
      var css = this.toCSS();
      zip.file("js/data.js", data);
      zip.file("css/" + name + ".css", css);
      zip.file("index.html", html);
      var files = [
        { name: "css/default.css", path: "./public/css/default.css" },
        { name: "js/jquery.js", path: "./public/libs/jquery/jquery-bare.js" },
        { name: "js/jquery-require.js", path: "./public/libs/jquery/jquery-require-export.js" },
        { name: "js/config.js", path: "./client/export/config.js" },
        { name: "js/Dobject.js", path: "./client/export/Dobject.js" },
        { name: "js/main.js", path: "./client/export/main.js" },
        { name: "js/SynerJ.js", path: "./client/export/SynerJ.js" },
        { name: "js/require.js", path: "./public/libs/require.js" }
      ];

      function addFiles(i) {
        if (i < files.length) {
          fs.readFile(files[i].path, function (err, data) {
            if (err) console.log(err);
            zip.file(files[i].name, data.toString());
            addFiles(++i);
          });
        } else {
          var buf = zip.generate({ base64: false, compression:'DEFLATE' });
          fs.writeFile('public/export/' + name + ".zip", buf, 'binary', function (err) {
            if (err)
              console.log(err);
            if (callback)
              callback(buf);
          });
        }
      }
      
      addFiles(0);
    };

    return Page;
  })();

  return Page;
});
