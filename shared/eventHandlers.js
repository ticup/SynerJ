// shared/EventHandlers.js
//
// Gives an object that contains all the eventHandlers that are both used by client and server.
// These eventHandlers are actually the deserialization of a command for something to happen
// to the environment. The serialization happens in the Dobject.js and SynerJ.js objects with
// the user of the SynerJ.sync function.
// 
// It is the task of the client and server's eventHandlers to add these eventHandlers to their
// socket.
//
// The "method" argument for the returned functions will be the core (client) or the
// synchronized (server) version of the method.
// This is done so that the same deserialization can be used for both sides.
//
// Author: Tim Coppieters
// Date: September 2011
define([], function () {
	
  var EventHandlers = (function () {
		
		function EventHandlers() {
			this.sharedEvents = {};
		}

		EventHandlers.prototype.add = function (event, handler) {
			this.sharedEvents[event] = handler;
		};

		return EventHandlers;
	})();

	var eventHandlers = new EventHandlers();

  // sets up event handlers for client and server.
	eventHandlers.add('create',
		function createHandler(config, SynerJ) {
      return function (method) {
        return SynerJ[method](config);
      };
    });
	
  eventHandlers.add('delete',
		function deleteHandler(config, SynerJ) {
      return function (method) {
        return SynerJ[method](config.id);
      };
	});
	
  eventHandlers.add('id',
		function setIdHandler(config, SynerJ) {
      var obj = SynerJ(config.id);
      var val = config.newId;
      return function (method) {
        return obj[method](val);
      };
  });

  eventHandlers.add('clone',
    function cloneHandler(config, SynerJ) {
      var obj = SynerJ(config.id);
      var newObj = config.newId && SynerJ(config.newId);
      return function (method) {
        return obj[method](newObj);
      };
    });
  
  eventHandlers.add('text',
		function setHtmlHandler(config, SynerJ) {
      var obj = SynerJ(config.id);
      var text = config.text;
      return function (method) {
        return obj[method](text);
      };
  });

	eventHandlers.add('bind',
		function bindHandler(config, SynerJ) {
			var obj = SynerJ(config.id);
      return function (method) {
        return obj[method](config.event, config.handler);
      };
  });

	eventHandlers.add('unbind',
		function unbindHandler(config, SynerJ) {
			var obj = SynerJ(config.id);
      return function (method) {
        return obj[method](config.event);
      };
  });

	eventHandlers.add('append',
		function appendHandler(config, SynerJ) {
			var parent = SynerJ(config.id);
			var child = SynerJ(config.childId);
      return function (method) {
        return parent[method](child);
      };
  });
	
  eventHandlers.add('before',
		function beforeHandler(config, SynerJ) {
			var right = SynerJ(config.rId);
			var left = SynerJ(config.lId);
      return function (method) {
        return right[method](left);
      };
  });

	eventHandlers.add('setProp',
		function setDataHandler(config, SynerJ) {
      var obj = SynerJ(config.id);
      return function (method) {
        return obj[method](config.name, config.val);
      };
  });
	
  eventHandlers.add('attr',
		function setAttrHandler(config, SynerJ) {
      var obj = SynerJ(config.id);
      return function (method) {
        return obj[method](config.name, config.val);
      };
  });
  
  eventHandlers.add('removeAttr',
		function removeAttrHandler(config, SynerJ) {
      var obj = SynerJ(config.id);
      return function (method) {
        obj[method](config.name);
      };
  });
	
	eventHandlers.add('removeProp',
		function removeDataHandler(config, SynerJ) {
			var obj = SynerJ(config.id);
      return function (method) {
       return obj[method](config.name);
      };
  });

	eventHandlers.add('setCss',
		function setStyleHandler(config, SynerJ) {
			var obj = SynerJ(config.id);
      return function (method) {
        return obj[method](config.name, config.val);
      };
  });
	
  eventHandlers.add('removeCss',
		function removeCssHandler(config, SynerJ) {
			var obj = SynerJ(config.id);
      return function (method) {
        return obj[method](config.name);
      };
  });
  
  return eventHandlers;
});

