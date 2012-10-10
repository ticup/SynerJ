// client/env/SynerJ.js
//
// Instantiates one shared/SynerJ.js object and extends it with:
//  1. The Mode module
//  2. Object locking:
//    - isLocked(obj)
//    - lockObject(obj, callback)
//    - freeObject(obj, callback)
//  3. Sync method: sends the given event with data to the server socket
//  4. Makes it useable as a function to get a object, eg: SynerJ('DobjectName')
//
// Author: Tim Coppieters
// Date: september 2011

define(["shared/SynerJ", "Mode", "jquery", "config"],
  function (sSynerJ, mode, $, config) {
  
  var SynerJ = (function () {
    // install container for Interface items
    $("body").append($("<div id=" + config.interfaceContainer + "></div>"));

    // instantiate shared SynerJ object
    var sObj = new sSynerJ(window);
    
    // make client-side SynerJ object that can be either called as
    // a function SynerJ('id') --> SynerJ.get('id')
    // or used as an object.
    var SynerJ = function (name) {
      return SynerJ.get(name);
    };
    
    // make the shared SynerJ functions accessible through SynerJ.
    SynerJ.constructor.prototype = sObj;
    SynerJ.__proto__ = sObj;

    // sync: this is used by the shared code and should emit the given event
    // and data to the server.
    SynerJ.sync = function (event, data, callback) {
      this.socket.emit(event, data, callback);
    };

    // exec: execute given code in the environment.
    SynerJ.exec = function (code, callback) {
      this.sync('exec', { code: code }, callback);
    };
   
    // Object locking: this provides a mechanism for the interfaces to use to let them
    // lock an object before the user can change it.

    // private callback function, used to store the callback in for when the lock
    // for an object is granted.
    var callback;
    
    // isLocked
    SynerJ.isLocked = function (obj) {
      return (this.locked && this.locked.id() == obj.id());
    };

    // lock object
    SynerJ.lockObject = function (obj, callback) {
      SynerJ.callback = callback;
      this.socket.emit('lock object', { id: obj.id() });
    };

    // free object
    SynerJ.freeObject = function () {
      var obj  = this.locked;
      if (obj) {
        this.locked = undefined;
        this.socket.emit('free object', { id: obj.id() });
      }
    };
    
    // lock granted: called by client/env/eventHandlers when an the object granted
    // event has been sent by the server.
    SynerJ.lockGranted = function (id) {
      this.locked = SynerJ(id);
      if (this.callback)
        this.callback();
    };

    // lock denied: called by the client/env/eventHandlers when the object lock denied
    // event was sent by the server.
    SynerJ.lockDenied = function (id) {
      alert('Object ' + id + ' is in use by another client.');
    };
    

    // debug: make the SynerJ object available to the global environment.
    // window.SynerJ = SynerJ;
   
    return SynerJ;
  })();

  return SynerJ;
});
