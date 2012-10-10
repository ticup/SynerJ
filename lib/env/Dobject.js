// lib/env/Dobject.js
//
// Implements the synchronized methods on the server-side.
// If the shared version isn't overwritten, nothing will happen on the server.
// So it's common to overwrite the shared version, do something on the server and then
// execute the shared version, which will propagate the changes to the clients.
//
// Author: Tim Coppieters
// Date: September 2011
//
// TODO: Write an abstraction that turns a shared method into a server-side method

define(['lib/env/Dobject.core', 'node-proxy'], function (Dobject, Proxy) {
  
 
  // array of methods that need to be ported to a server-side method
  methodsToPort = [
    "setProp", "removeProp", "prop",
    "attr",
    "setCss", "removeCss",
    "bind", "unbind",
    "append", "before", "after",
    "text"
  ];

  // call: this method is an exception, it doesnt not exist in the shared Dobject
  // and it does not need to inform the clients to do something.
  Dobject.prototype.call = function (name) {
    var args = argsArray(arguments).slice(1);
    var fct = this._getProp(name);
    if (typeof fct === 'function') {
      return this.SynerJ.call(this, fct, args);
    } else
      throw({ name: 'ArgumentError', message: "Error: " + name + " is not a function" });
  };

  // trigger: same exception as call
  Dobject.prototype.trigger = function (event) {
    return this._trigger(event);
  };

  function argsArray(obj) {
    var args = [];
    for (var i=0; i<obj.length; i++)
      args.push(obj[i]);
    return args;
  }

  // id: special case because the id changes
  Dobject.prototype.id = (function () {
    var share = Dobject.prototype.id;

    return function id(newId) {
      var res;
      if (newId) {
        share.call(this, newId);
        res = this._id(newId);
      } else {
        res = this._id();
      }
      return res;
    };
  })();

  // clone
  Dobject.prototype.clone = (function () {
    var share = Dobject.prototype.clone;

    return function clone() {
      var SynerJ = this.SynerJ;
      // create fresh objects for the clones
      var newObj = SynerJ.create({type: this._tag(), parent: this._parent()});

      function makeChildren(obj, parent) {
        var children = obj._children();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var newObj = SynerJ.create({type: child._tag(), parent: parent});
          makeChildren(child, newObj);
        }
      }

      makeChildren(this, newObj);
    
      // clone on server
      this._clone(newObj);

      // clone on clients
      share.call(this, newObj);

      return newObj;
    };
  })();
      

  // serverPortMethod: extends the shared synchronized version of the method
  // with a version that first executes the core method on the server and then
  // uses the shared synchronized version to instruct the clients.
  function serverPortMethod(obj, nam) {
    var shared = obj[nam];
    

    obj[nam] = function () {
      // make a real array out of the arguments objects.
      var args = argsArray(arguments);

      // execute the method on the server environment
      var res = this["_" + nam].apply(this, args);
      
      // if you use a config object in as argument for the core method, you can
      // add information to it on the server and all the clients will get it.
      // (see ._clone)
      // instruct the clients to execute the method if it changes the environment.
      // WARNING: at the moment we consider the environment changed when there are
      // arguments given. If a somehow method is added that changes the environment
      // without arguments, change this.
      //if (arguments.length > 0) {
        shared.apply(this, args);
      //}

      return res;
    };
  }

  // port the methods
  for (var i=0; i<methodsToPort.length; i++) {
    serverPortMethod(Dobject.prototype, methodsToPort[i]);
  }

  // create a proxy for the Dobject object so that properties can be accessed,
  // set and executed through the dot operator.
  function dobjectHandler(obj) {
    this.obj = obj;
  }

  dobjectHandler.prototype = {
    has: function (nam) {
      return !!this.obj.getProp(nam);
    },
    get: function (rcvr, nam) {
      // TODO: perform a more thorough check here. This should filter all the standard
      // property values.
      if (nam == 'prototype' || nam == 'constructor')
        return this.obj.getProp(nam);

      // check if nam is a function defined by the Dobject prototype
      var val = this.obj[nam];

      // if not, get the property using getProp
      if (!val)
        val = this.obj.getProp(nam);

      return val;
    },
    set: function (rcvr, nam, val) {
      return this.obj.setProp(nam, val);
    },
    delete: function (nam) {
      return this.obj.removeProp(nam);
    },
    enumerate: function () {
      var nams = [];
      var props = this.obj.getProp();
      for (var nam in props) { nams.push(nam); }
      return nams;
    },
    keys: function () {
      return Object.keys(this.obj.getProp());
    }
  };

  var ProxyDobject = function ProxyDobject(config, SynerJ) {
    var obj = new Dobject(config, SynerJ);
    
    return Proxy.create(new dobjectHandler(obj), Object.getPrototypeOf(obj));
  };

  ProxyDobject.instanceOf = function instanceOf(obj) {
    return obj instanceof Dobject;
  };

return ProxyDobject;
});
