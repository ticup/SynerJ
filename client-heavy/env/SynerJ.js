define(["sSynerJ", "jquery", "Dobject", "Mode",], function (sSynerJ, $, Dobject, Mode) {
  
  var SynerJ = (function () {
    // install container for SynerJ items
    $("body").append($("<div id=SynerJ></div>"));
    
    // private handlers container
    var handlers = {};

    // instantiate shared SynerJ
    var sObj = new sSynerJ(window);
    
    // make client-side SynerJ object that can be either called as
    // a function SynerJ('id') --> SynerJ.get('id')
    // or used as an object.
    var SynerJ = function (name) {
      return SynerJ.get(name);
    };
    // debug
    SynerJ.handlers = handlers;
    // make the shared SynerJ functions accessible through SynerJ.
    SynerJ.constructor.prototype = sObj;
    SynerJ.__proto__ = sObj;

    // sync: this is used by the shared code and should emit the given event
    // and data to the server.
    SynerJ.sync = function (event, data, callback) {
      this.socket.emit(event, data, callback);
    };
   
    SynerJ.Mode = new Mode();

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
    
    // lock granted
    SynerJ.lockGranted = function (id) {
      this.locked = SynerJ(id);
      if (this.callback)
        this.callback();
    };

    // lock denied
    SynerJ.lockDenied = function (id) {
      alert('Object ' + id + ' is in use by another client.');
    };
    

    // debug
    //window.SynerJ = SynerJ;
    return SynerJ;
  })();

  return SynerJ;
});
