// client/env/Dobject.js
// Client version of the Dobject object.
// Extends the shared version from shared/Dobject.js with client-specific operations

// Author: Tim Coppieters
// Date: September 2011

define(['sDobject'], function (Dobject) { 
    // call: executes given method on the server. 
    Dobject.prototype.call = function (name) {
      var args = [];
      for(var i = 1; i<arguments.length; i++)
        args.push(arguments[i]);
      this.SynerJ.sync('call', { id: this.id(), name: name, args: args });
    };
    
    // setProp
    Dobject.prototype._setProp = (function () {
      var sSetProp = Dobject.prototype._setProp;

      function setProp(name, val) {
        sSetProp.call(this, name, val);
        val = this._getProp(name);
        if (name === 'prototype' && val instanceof Dobject) {
          val._listenForEvents();
        };
      };

      return setProp;
    })();

    // bind function
    Dobject.prototype._bind = (function () {
      var sbind = Dobject.prototype._bind;

      function bind(event, handler) {
        if (typeof handler === 'function') {
          var handler = handler.toString();
        }
        // save the handler
        this.SynerJ.addHandler(this.id(), event, handler);
        var id = this.id()
        var obj = this;
        var $ = this.SynerJ.window.jQuery;
        this._listenForEvent(event);
      }

    return bind;
    })();
 
  // listen for events
  Dobject.prototype._listenForEvents = function () {
    var id = this.id();
    var handlers = this.SynerJ.getHandlers(id);
    for (var event in handlers) {
      this._listenForEvent(event);
    }
  }

  // listen for event
  Dobject.prototype._listenForEvent = function (event) {
    var SynerJ = this.SynerJ;
    if (SynerJ.Mode.isApplication()) {
      var chandler = function (e) {
        SynerJ($(this).attr('id')).trigger(event);
      };
      this.jqEl.unbind(event);
      this.jqEl.bind(event, chandler);
      this._applyToHasPrototype(function (obj) {
        obj.jqEl.unbind(event);
        obj.jqEl.bind(event, chandler);
      });
    }
  }
    
   // extend the shared unbind function so that when a handler is unbound,
   // it is also removed from the handler container.
   Dobject.prototype._unbind = (function () {
    // save shared unbind function
    var sunbind = Dobject.prototype._unbind;
    
    // the new unbind function
    function unbind(event) {
      this.SynerJ.removeHandler(this.id(), event);
      if (this.SynerJ.Mode.isApplication()) {
        sunbind.call(this, event);
      }
    };

    return unbind;
   })();

  return Dobject;
});
