define(["SynerJ.core"], function (cSynerJ) {

  // exec: executes the given commmand on the given obj and
  // gives it acces to the SynerJ object.
  cSynerJ.prototype.exec = function (command, obj) {
    var SynerJ = this;
    // make the alert available
    function alert(msg) {
      SynerJ.sync('alert', { message: msg });
    }

    // make the console.log available
    var console = {};
    console.log = function clientlog(msg) {
      SynerJ.sync('console.log', { message: msg });
    };
    
    // if an object is given, executed given command on the object
    // in this context
    if (obj)
      return eval("this._get('" + obj.id() + "')." + command);
    
    // if no object is given, evaluate given code in this context
    return eval(command);
  };
  
  // call
  cSynerJ.prototype.call = function (obj, fct, args) {
    var SynerJ  = this;

    return fct.apply(obj, args);
  };

  // sync: triggers the event on all the connected clients.
  cSynerJ.prototype.sync = function sync(event, data) {
    this.sockets.emit(event, data);
  };

  // create
  cSynerJ.prototype.create = (function () {
    var sync = cSynerJ.prototype.create;

    function create(config) {
      config = typeof config == 'undefined' ? {} : config;
      var obj = this._create(config);
      sync.call(this, config);
      return obj;
    }

    return create;
  })();
  
  // delete
  cSynerJ.prototype.delete = (function () {
    var sync = cSynerJ.prototype.delete;

    function deleteObj(id) {
      this._delete(id);
      sync.call(this, id);
    }

    return deleteObj;
  })();

  // lock object
  cSynerJ.prototype.lockObject = function (obj, socket) {
    var id = obj.id();
    if (this.lockedObjects[id])
      return false;
    this.lockedObjects[id] = socket;
    return true;
  };

  // free object
  cSynerJ.prototype.freeObject = function (obj) {
    var id = obj.id();
    delete this.lockedObjects[id];
  };

  // Removes the lock for the given socket (if any).
  // This is used when the client disconnects, so that an open lock is freed.
  cSynerJ.prototype.freeLock = function (socket) {
    for (var id in this.lockedObjects) {
      if (this.lockedObjects[id] == socket)
        delete this.lockedObjects[id];
    }
  };
 
  // extend the shared SynerJ object with an environment for the user to
  // execute commands in.
  var modSynerJ = function (window) {
    var sObj  = new cSynerJ(window);

    // extend the SynerJ object so it can be called as a function
    // to search for an object
    function SynerJ(name) {
      return SynerJ._get(name);
    }
    
    // let the new SynerJ behave like the shared SynerJ
    SynerJ.constructor.prototype = sObj;
    SynerJ.__proto__ = sObj;
    
    return SynerJ;
  };
  
  return modSynerJ;
});
