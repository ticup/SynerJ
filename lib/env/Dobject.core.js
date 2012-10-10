// lib/env/Dobject.core.js
//
// Some actions on the server require next to the core code from
// /shared/Dobject additional actions. Therefore we modify the ._
// functions using self-modifying functions.
//
// Author: Tim Coppieters
// Date: September 2011
define(['shared/Dobject', 'lib/config', 'node-proxy'], function (Dobject, settings, Proxy) {

  // id
  Dobject.prototype._id = (function () {
    var sId = Dobject.prototype._id;

    function setId(id) {
      if (id) {
        var old = this.id();
        var res = sId.call(this, id);
        this.SynerJ._updateId(old, this.id());
      } else {
        var res = sId.call(this, id);
      }
      return res;
    }

    return setId;
  })();

  // setProp: On the server-side a property can be set in 2 ways:
  // 1. The user has set the property directly through the UI, then the value will always
  //    be a string. In the shared version we already parse these strings to their real value,
  //    except for the function, because we don't need the real function on the client-side,
  //    so we just let it be there as a string.
  // 2. The property gets set in the body of a function, then the value will be the actual
  //    value, because it is already parsed by the eval interpreter.
  // If the property is set through way 2, we want need to do 2 things:
  // - make a real function out of the function string.
  // - save the function string as it is given, so that comments and indention are saved
  //   for later editing of the function.
  Dobject.prototype._setProp = (function () {
    var sSetProp = Dobject.prototype._setProp;
    
    function setProp(name, val) {
      checkProperty(val);
      val = parseProperty(val);
      // save a string representation of the value 
      if (val &&
          ((typeof val === 'string') ||
           ((typeof val == 'object') && val instanceof String))) {
        val = val.toString();
        this.SynerJ._setFunctionString(this, name, val);
        if (val.indexOf('function') === 0) {
          this.SynerJ.exec("jqEl.data('" + name + "', " + val + ");", this);
          return this;
        }
      }
      // save the real value
      var res = sSetProp.call(this, name, val);
      return res;
     }

    return setProp;
  })();
  
  // checkProperty: check if the property is legal
  function checkProperty(val) {
    if (typeof val == 'object' && !(Dobject.instanceOf(val))) {
      throw "Cannot assign normal objects as properties: " + val;
    }
  }

  // parseProperty: If the user has set the property through the editor, the property
  // will be a string. This function makes a real value of it.
  function parseProperty(val) {
    if (typeof val != 'string' || (! val instanceof String)) {
      return val;
    }

    if (typeof val === 'string') {
      if (val == 'true')
        return true;
      if (val == 'false')
        return false;
    }
   
    if (typeof val === 'boolean') {
      return val;
    }

    // number?
    if (!isNaN(val-0)) {
      return parseInt(val);
   }

    return val;
  }
  
  // removeData: the data attribute needs ot be removed as wel.
	Dobject.prototype._removeProp = (function () {
    var sRemoveProp = Dobject.prototype._removeProp;

    function removeProp (name) {
      this.SynerJ._removeFunctionString(this, name);
      return sRemoveProp.call(this, name);
	  }

    return removeProp;
  })();
    
  // bind
  Dobject.prototype._bind = (function () {
    var sbind = Dobject.prototype._bind;

    var bind = function (event, handler) {
      // we only allow 1 handler per event.
      this._unbind(event);
      // if the handler comes from the server, it's a real function,
      // if it comes from a client which added it through the gui, it's a string.
      if (typeof handler === 'function')
        handler = handler.toString();
      // save the string version
      this.SynerJ._addHandler(this.id(), event, handler);
      // save the function version
      this.SynerJ.exec("jqEl.bind('" + event + "', " +  handler + ");", this);
    };

    return bind;
  })();

  // unbind
  Dobject.prototype._unbind = (function () {
    var sunbind = Dobject.prototype._unbind;

    var unbind = function (event) {
      this.SynerJ._removeHandler(this.id(), event);
      sunbind.call(this, event);
    };

    return unbind;
  })();

  // getHandler
  Dobject.prototype._getHandler = function (event) {
    return this._chainUp(function getHandler(obj) {
      var handlers = obj.jqEl.data('events');
      handlers = handlers ? handlers[event] : undefined;
      var handler = (handlers && handlers.length > 0) ? handlers[0] : undefined;
      handler = handler ? handler.handler : undefined;
      if (!handler)
        return undefined;
      return handler;
    });
  };

  // getHandlers
  Dobject.prototype._getHandlers = function (event) {
    var handlers = this.jqEl.data('events');
    var res = {};
    for (var name in handlers) {
      res[name] = handlers[name][0].handler;
    }
    return res;
  };

  // trigger: same exception as call
  Dobject.prototype._trigger = function (event) {
    var args = argsArray(arguments).slice(1);
    args.unshift(event);
    var handler = this._getHandler(event);
    if (handler)
      handler.apply(this, args);
  };

  function argsArray(obj) {
    var args = [];
    for (var i=0; i<obj.length; i++)
      args.push(obj[i]);
    return args;
  }

  return Dobject;
});
