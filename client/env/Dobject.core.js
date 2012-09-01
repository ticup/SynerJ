define(['sDobject'], function (Dobject) {
  // setProp: if the new property is a new prototype, then set up the prototype chain
  // to listen to the correct events (according to the new prototype).
  Dobject.prototype._setProp = (function () {
    var sSetProp = Dobject.prototype._setProp;

    function setProp(name, val) {
      sSetProp.call(this, name, val);
      val = this._getProp(name);
      if (name === 'prototype' && Dobject.instanceOf(val)) {
        val._listenForEvents();
      };
    };

    return setProp;
  })();


  // bind: Instead of actually listening for the event with this handler, we save the handler
  // as a string (because on the client-side we are only interested in the string representation
  // of the function) and we set up a pass-to-server-listener for the event.
  Dobject.prototype._bind = function _bind(event, handler) {
    // we only allow 1 handler per event
    this._unbind(event);
    // save the string representation 
    this.SynerJ._addHandler(this.id(), event, handler);
    this._listenForEvent(event);
  };

  // unbind: Remove the saved string represenation in the SynerJ object and 
  Dobject.prototype._unbind = function _unbind(event) {
    this.SynerJ._removeHandler(this.id(), event);
    this._stopListenForEvent();
  };

  // listen for events: This will set up pass-to-server-listeners for all the events this 
  // object has handlers of.
  Dobject.prototype._listenForEvents = function () {
    var id = this.id();
    var handlers = this.SynerJ._getHandlers(id);
    for (var event in handlers) {
      this._listenForEvent(event);
    }
  };

  // listen for event: This will set up a pass-to-server-listener for given event for this
  // object and all the objects that have this object in its prototype chain.
  // A pass-to-server-listener simply propagates the event trigger to the server.
  Dobject.prototype._listenForEvent = function listenForEvent(event) {
    var SynerJ = this.SynerJ;
    if (SynerJ.Mode && SynerJ.Mode.isApplication()) {
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
  };

  // stop listen for event: Removes the pass-to-server-listeners for given event for
  // this object and all objects that have this object in their chain, unless an other
  // object is in between them that also listens for this event.
  Dobject.prototype._stopListenForEvent = function stopListenForEvent(event) {
    var SynerJ = this.SynerJ;
    if (SynerJ.Mode.isApplication()) {
      // note: this can be done way more performant
      this._applyToHasPrototype(function (obj) {
        obj.jqEl.unbind(event);
      });

      this.applyToHasPrototype(function (obj) {
        if (SynerJ._getHandlers(obj)[event]) {
          obj._listenForEvent(event);
          return false;
        }
      });
    }
  };

  return Dobject;
});
