// lib/server/Sockets.js
//
// Collection of Sockets.
// - sockets = new Sockets();
// - sockets.emit(event, data)
// - sockets.push(socket)
// - sockets.remove(socket)
//
// Author: Tim Coppieters
// Date: September 2011

define([], function () {

  var Sockets = (function () {
    
    // constructor
    function Sockets() {
      this.sockets = [];
    }

    // emit
    Sockets.prototype.emit = function (event, data) {
      var sockets = this.sockets;
      for (var i=0; i<sockets.length; i++) {
        sockets[i].emit(event, data);
      }
    };

    // push
    Sockets.prototype.push = function (socket) {
      this.sockets.push(socket);
    };

    // delete
    Sockets.prototype.remove = function (socket) {
      var sockets = this.sockets;
      var idx = sockets.indexOf(socket);
      if (idx != -1) sockets.splice(idx, 1);
    };

    return Sockets;
  })();

  return Sockets;
});
