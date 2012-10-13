// lib/env/eventHandlers
//
// Adds the server-specific eventHandlers.
// API:
// - addEventHandlers(page, socket)
//
// Author: Tim Coppieters
// Date: 2011

define(['shared/eventHandlers'],
    function (eventHandlers) {

  // addEventListeners: adds the shared and server-specific handlers to the given
  // socket for given page with given sockets as clients.
  eventHandlers.addEventListeners = function (page, socket) {
		var sharedHandlers = this.sharedEvents;
		var serverHandlers = this.serverHandlers;
    // add shared handlers
    for (var event in sharedHandlers)	{
      var sharedHandler = sharedHandlers[event];
			addPropagatingHandler(page, socket, event, sharedHandler);
		}
    // add server specific handlers
    for (var event in serverHandlers) {
      var serverHandler = serverHandlers[event];
      addServerHandler(event, socket, serverHandler, page);
    }
  };
  
  // addServerHandler
  function addServerHandler(event, socket, handler, page) {
    socket.on(event, function (data, callback) {
      try {
        var res = handler(data, page.window.SynerJ, socket);
        // calls the callback given on the client-side
            console.log('callback result: ' + res);
        if (callback) {
          if (page.window.SynerJ.Dobject.instanceOf(res))
            res = res.id();
          callback(res);
        }
        page.save();
      } catch (err) {
        console.log(err);
        var msg = (typeof err == 'object') ? err.message : err;
        socket.emit('error', { message: msg });
      }
    });
  }

  // addPropagatingHandler: add a handler that executes the shared code on the server
  // and then triggers the same event on all the clients.
	function addPropagatingHandler(page, socket, event, sharedHandler) {
    socket.on(event, function (data, callback) {
      try {
          // execute the synchronized method belonging to this
          // event on the environment using the deserializer function (sharedHandler).
          var exec = sharedHandler(data, page.window.SynerJ);
          var res = exec(event);

          // calls the callback given on the client-side
          if (callback) {
            // if a Dobject is returned, return the id instead
            if (page.window.SynerJ.Dobject.instanceOf(res)) {
              res = res.id();
            }
            callback(res);
          }
          // save page
          page.save();
      // if something went wrong executing the method, let the client
      // that instructed the event know.
      } catch (err) {
       console.log(err);
       var msg = (typeof err == 'object') ? err.message : err;
       socket.emit('error', { message: msg });
     }
		});
	}

	
  // serverHandlers
  eventHandlers.serverHandlers = {};
  eventHandlers.addServerEvent = function (event, handler) {
    this.serverHandlers[event] = handler;
  };

  // call
  eventHandlers.addServerEvent('call', function afterCallMethod(config, SynerJ, socket) {
    var obj = SynerJ(config.id);
    var args = config.args;
    args.unshift(config.name);
    obj.call.apply(obj, args);
  });

  // trigger
  eventHandlers.addServerEvent('trigger', function afterTrigger(config, SynerJ) {
    var obj = SynerJ(config.id);
    obj.trigger(config.event);
  });

  // exec
  eventHandlers.addServerEvent('exec', function afterExec(config, SynerJ) {
  console.log(config.code);
    return SynerJ.exec(config.code);
  });

  // lock object
  eventHandlers.addServerEvent('lock object', function afterLockObject(config, SynerJ, socket) {
    var obj = SynerJ(config.id);
    if (SynerJ.lockObject(obj, socket)) {
      socket.emit('lock granted', config);
    } else {
      socket.emit('lock denied', config);
    }
  });

  // free object
  eventHandlers.addServerEvent('free object', function afterFreeObject(config, SynerJ) {
    var obj = SynerJ(config.id);
    SynerJ.freeObject(obj);
  });
	
  return eventHandlers;
});
