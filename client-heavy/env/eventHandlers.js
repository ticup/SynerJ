define(['sEventHandlers', 'SynerJ'], function (eventHandlers, SynerJ) {

  // initSocket: adds the shared and client eventHandlers to the socket.
	eventHandlers.initSocket = function (socket) {
		var sEvents = this.sharedEvents;
		var asEvents = this.afterSharedEvents;
    var cEvents = this.clientEvents;
    // add the shared handlers
    for (var event in sEvents) {
			var sHandler = sEvents[event];
			var asHandler = asEvents[event]; 
			addSharedEventHandler(socket, event, sHandler, asHandler);
		}
    // add the client specific handlers
    for (var event in cEvents) {
      var handler = cEvents[event];
      addEventHandler(socket, event, handler);  
    }
	};

  // addEventHandler: listen for given event and execute the server's callback
  // with the result of the handler. 
  function addEventHandler(socket, event, handler) {
    socket.on(event, function (data, callback) {
      var res = handler(data, SynerJ);
      if (callback)
        callback(res);
    });
  }

  // addSharedEventHandler: adds the shared and client handlers to the given socket
  // for the given event.
	function addSharedEventHandler(socket, event, sHandler, cHandler) {
		socket.on(event, function (data, callback) {
				// exevute shared code
				if (sHandler)
          var res = sHandler(data, SynerJ);
				// execute client specific code. 
        if (cHandler)
					cHandler(data, SynerJ);
        // execute the client's callback if there is any.
        if (callback)
          callback(res);
		});
	};

  // afterSharedEvents
	eventHandlers.afterSharedEvents = {};
  eventHandlers.addAfterSharedEvent = function (event, handler) {
    this.afterSharedEvents[event] = handler;
  };
  
  // clientEvents
	eventHandlers.clientEvents = {};
  eventHandlers.addClientEvent = function (event, handler) {
    this.clientEvents[event] = handler;
  };

  // Client specific event handlers
  eventHandlers.addClientEvent('lock granted', function (data, SynerJ) {
    SynerJ.lockGranted(data.id);
  });

  eventHandlers.addClientEvent('lock denied', function (data, SynerJ) {
    SynerJ.lockDenied(data.id);
  });
  
  eventHandlers.addClientEvent('value', function (data, SynerJ, callback) {
    var inpt = SynerJ(data.id);
    var val = inpt._val();
    if (callback) callback(val);
  });

  // handlers that are executed after the corresponding shared handler has been
  // executed. These handlers should make sure that when such a shared handler
  // changes something to the environment, the developer's tools are syncronized
  // correctly with that change.
  eventHandlers.addAfterSharedEvent('create', function (data, SynerJ) {
    if (SynerJ.Inspector)
      SynerJ.Inspector.addNode(data.id, data.parentId);
  });
	
  eventHandlers.addAfterSharedEvent('delete', function (data, SynerJ) {
    if (SynerJ.Inspector)
      SynerJ.Inspector.deleteNode(data.id);
  });

  eventHandlers.addAfterSharedEvent('before', function (data, SynerJ) {
    if (SynerJ.Inspector)
      SynerJ.Inspector.beforeNode(data.rId, data.lId);
  });

  eventHandlers.addAfterSharedEvent('append', function (data, SynerJ) {
    if (SynerJ.Editor)
      // append can possibly erase the html attribute, so refresh editor
      SynerJ.Editor.refresh();
    if (SynerJ.Inspector)
      SynerJ.Inspector.appendNode(data.id, data.childId);
  });

	eventHandlers.addAfterSharedEvent('data', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});
	
  eventHandlers.addAfterSharedEvent('removeData', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});
  
  eventHandlers.addAfterSharedEvent('removeCss', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});
  
  eventHandlers.addAfterSharedEvent('removeAttr', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});
	
  eventHandlers.addAfterSharedEvent('unbind', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});
  
  eventHandlers.addAfterSharedEvent('text', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});
	
  eventHandlers.addAfterSharedEvent('attr', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});

	eventHandlers.addAfterSharedEvent('css', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});

	eventHandlers.addAfterSharedEvent('bind', function (data, SynerJ) {
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
	});
  
  eventHandlers.addAfterSharedEvent('id', function (data, SynerJ) {
    if (SynerJ.Inspector)
      SynerJ.Inspector.renameNode(data.id, data.newId);
    if (SynerJ.Editor)
      SynerJ.Editor.refresh();
  });
	return eventHandlers;
});
