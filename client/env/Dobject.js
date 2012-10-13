// client/env/Dobject.js
//
// Client version of the Dobject object.
// Extends the shared version from shared/Dobject.js with client-specific operations
//
// Dobject module loading and extending until here:
// shared/Dobject.core -> shared/Dobject -> client/Dobject.core -> here
//
// Author: Tim Coppieters
// Date: September 2011

define(['Dobject.core'], function (Dobject) {
  
  // call: executes given method on the server.
  Dobject.prototype.call = function (name) {
    var args = [];
    for(var i = 1; i<arguments.length; i++)
      args.push(arguments[i]);
    this.SynerJ.sync('call', { id: this.id(), name: name, args: args });
  };


  return Dobject;
});
