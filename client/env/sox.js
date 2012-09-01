// client/env/sox.js
//
// Implements the socket connection between server and client.
// Uses the client/env/eventHandlers to set up the handlers for the socket.
//
// Author: Tim Coppieters
// Date: September 2011

define(['SynerJ', "socket", 'eventHandlers', 'config'],
		function (SynerJ, io, eventHandlers, config) {
	
  // set up socket connection with server
  SynerJ.socket = io.connect('http://' + config.url + ':' + config.port + '/');

	SynerJ.socket.on('connect', function () {
		
    // authorize with the server
    SynerJ.socket.emit('auth', SynerJ.docName);
		
    SynerJ.socket.on('disconnect', function () {
			
      // when disconnected: deauth
      SynerJ.socket.emit('deauth', SynerJ.docName);
		});

    // we are authed with the server
    SynerJ.socket.on('auth', function authed(data) {
      //SynerJ.initDevelopment();
    });
	});

  // set up the eventHandlers on the socket
  eventHandlers.addEventHandlers(SynerJ.socket);

	return SynerJ;
});
