// lib/server/scripts.js
//
// Serves scripts from the client and shared library.
// These scripts are served manually, because we want to be able to restrict
// certain clients from certain files (such as admin files for unauthorized clients).
//
// API:
// - serverScript(nam, req, res)
define(['fs', 'config', 'pages'], function (fs, config, pages) {

  var serveScript = function (nam, req, res) {
    nam = nam.slice(1);

    // main-admin.js is a file that cannot be requested directly,
    // if the client is authed and requests main.js, it will get main-admin.js
    //if (nam == 'main-admin.js') {
    //  var body = "<html><head></head><body><h1>401 Unauthorized.</h1></body></html>";
    //  res.writeHead(404, {
    //    'WWW-Authenticate': 'Basic realm="Secure Area"',
     //   'Content-Type': 'text/html',
     //   'Content-Length': body.length });
     // return res.end();
    //}

    // TODO: bug: when the user has 2 pages open and is authed for one and requests
    // a non-admin page, it will get the admin page.

    // main.js is a special file that is served differently depending whether the user
    // is authed or not
    //if (nam == 'client/main.js') {
    //  console.log(req.connection.remoteAddress);
      // if the user is authed, send the main-admin.js file instead of the main.js file
    //  if (pages.isAuthed(req.connection.remoteAddress)) {
    //    nam = 'client/main-admin.js';
    //  }
   // }
    fs.readFile(nam,
        function (err, data) {
          if (err) {
            console.log(err);
            res.writeHead(500);
            return res.end(config.pageNotFound);
          }
          console.log("sending script: " + nam);
          res.writeHead(200, {'Content-Type': 'text/javascript'});
          res.end(data);
        });
  };

  return {
    serveScript: serveScript
  };
});
