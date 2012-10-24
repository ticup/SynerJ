// lib/server/sox.js
//
// Handles the socket connection between client-server.
// API:
// - init(app, pages)
// - createSocket(pageNam, pages)
//
// Author: Tim Coppieters
// Date: September 2011

define(['eventHandlers', 'lib/server/Sockets', 'socket.io'],
  function (eventHandlers, Sockets, socketIO) {
	
  var io;
	var openSox = {};

  // setup the sockets on the app
	function init(app, pages) {
		io = socketIO.listen(app);

    // save the pages
    Page = pages;

		// setup event listeners
		io.sockets.on('connection', function(socket) {
      // auth
			socket.on('auth', function (pageNam) {
        try {
          var page = pages.getPage(pageNam);
          authorize(pageNam, socket);
          eventHandlers.addEventListeners(page, socket);
        } catch (err) {
          console.log(err);
        }
      });

      // disconnect
			socket.on('disconnect', function() {
        deauthorize(socket, pages);
      });
			
      // instruct client to auth itself.
			socket.emit('auth');
    });
   
   return io;
  }
	
  // authorize: add the socket to the openSox list of
	// its current document and set the socket its pageNam property.
	function authorize(pageNam, socket) {
		console.log('authorizing ' + pageNam);
    var sox = openSox[pageNam];
		if (!sox) {
      throw "trying to connect to unexisting page: " + pageNam;
    }
    openSox[pageNam].push(socket);
		socket.set('pageNam', pageNam);
	}

	// deauthorize: remove the socket from the openSox list.
	function deauthorize(socket, pages) {
		socket.get('pageNam', function (err, pageNam) {
      if (err) throw err;
      console.log('deauthorizing ' + pageNam + " for client: " + socket.handshake.address);
      // TODO: check this, sometimes the pageNam is null (when the client has been afk for long time!)
      if (pageNam) {
        openSox[pageNam].remove(socket);
        var page = pages.getPage(pageNam);
        page.window.SynerJ.freeLock(socket);
        pages.deauth(socket.handshake.address.address, pageNam);
      }
    });
  }
 
  // createSockets: creates a socket collection for given page.
  // This collection will contain all connected clients for given page.
  function createSockets(pageNam, page) {
    var sockets = openSox[pageNam] = new Sockets();
    return sockets;
  }

	return {
		init: init,
    createSockets: createSockets
  };
});
