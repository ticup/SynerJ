// client/export/SynerJ.js
//
// SynerJ object for the exported stand-alone applications.
//
// API:
// - SynerJ.get(id)
// - SynerJ.create(options)
//    options:
//      - type: "DOM element type"
//      - hidden: true/false
// - SynerJ.delete(id)
// - SynerJ.delete(obj)
//
// - SynerJ.treeWalk(parent, fct)
//
// - SynerJ.addHandler(id, name, event)
// - SynerJ.removeHandler(id, name)
// - SynerJ.getHandlers(id)
// - SynerJ.renameHandlers(oldId, newId)
//
// Author: Tim Coppieters
// Date: September 2011

define(['Dobject', 'config'], function(Dobject, cfg) {
	var SynerJ = (function() {

		// constructor
		function SynerJ(window) {
			this.id = Math.random();
      this.window = window;
			this.document = this.window.document;
			this.docName = this.document.title;
      this.handlers = {};
      // install info container in DOM tree
      var $ = this.window.jQuery;
      if($('#SynerJ-info').length === 0)
        $('body').append($('<div id=SynerJ-info></div>'));
      
      // objects parent
      this.objectsParent = this.get($('#' + cfg.objectsParent));
    }
	
    SynerJ.prototype.Dobject = Dobject;

    // get
    SynerJ.prototype.get = function (arg) {
      var jqObj;
      if (typeof arg === 'string')
        jqObj = this.window.jQuery("[id='" + arg + "']");
      else
        jqObj = this.window.jQuery(arg);
      jqObj = (jqObj.length >= 1) ? jqObj.first() : undefined;
      var dobj = jqObj ? new Dobject(jqObj, this) : undefined;
      return dobj;
    };

    // create
    SynerJ.prototype.create = function (config) {
      config = (typeof config === 'undefined') ? {} : config;
      config.id = typeof config.id == 'undefined' ?
        (settings.DobjectIdName + settings.tagSeparator + this.nextId()) :
        config.id; 
      // a normal object = hidden div
      if (!config.type || config.type == 'none') {
        config.type = 'div';
        config.hidden = 'true';
      }
      // create DOM element
      var $ = this.window.jQuery;
      var domEl = this.document.createElement(config.type);
      var jqEl = $(domEl);
      jqEl.attr('id', config.id);
      if (config.hidden)
        jqEl.hide();
      var dobj = this.get(jqEl);
      // insert into tree
      var parent = config.parent;
      if (!parent) {
        config.parentId = config.parentId ||
          ( config.hidden ? cfg.normalObjectsParent : cfg.dobjectsParent );
        parent = this.get(config.parentId);
      }
      if (!Dobject.instanceOf(parent))
        throw "Given parent is not valid config.parentId: " + config.parentId + "; parent: " + config.parent;
      parent.append(dobj);
      return dobj;
    };

  // nextId
  SynerJ.prototype.nextId = function nextId() {
    var idGenerator = this.window.jQuery('#SynerJ-idGenerator');
    var id = ++(parseInt(idGenerator.html()));
    idGenerator.html(id);
    return id;
  };

    // delete
    SynerJ.prototype.delete = function (obj) {
      if (typeof obj === 'string')
        obj = this.get(obj);

      if (!Dobject.instanceOf(obj))
        throw "SynerJ.Delete: Expected a Dobject or id of a Dobject, given: " + obj;

      // delete all references to the obj
      this.treeWalk(this.objectsParent, function forEachObject(cObj) {
        if (!cObj.equals(obj)) {
          cObj.forEachProp(function forEachProp(name, val) {
            if (Dobject.instanceOf(val) && val.equals(obj)) {
              cObj.removeProp(name);
            }
          });
        }
      });

      // delete all children
      var children = obj.children();
      for (var i=0; i<children.length; i++) {
        var child = children[i];
        var childId = child.id();
        this.delete(childId);
      }

      // delete the object it's style and jqEl
      deleteStyle(obj);
      obj.jqEl.remove();
    };
    
    // treeWalk
    SynerJ.prototype.treeWalk = function (parent, fct) {
      var children = parent.children();
      fct(parent);
      for(var i = 0; i<children.length; i++)
        this.treeWalk(children[i], fct);
    };
    
    // deleteStyle: remove the CSSOM object for this object.
    function deleteStyle(obj) {
      var document = obj.SynerJ.document;
      var sheet = document.styleSheets[1];
      var rules = sheet.cssRules;
      var id = obj.id();
      var lowrName = id.toLowerCase();
      for (var i=0; i<rules.length; i++) {
        if(rules[i].selectorText.toLowerCase().indexOf(lowrName) == 1) {
          sheet.deleteRule(i--);
        }
      }
    }

    // addHandler
    SynerJ.prototype._addHandler = function (id, event, handler) {
      var handlers = this.handlers;
      var objHandlers = handlers[id];
      if (!objHandlers)
        objHandlers = handlers[id] = {};
      return objHandlers[event] = handler;
    };

    // removeHandlers
    SynerJ.prototype._removeHandler = function (id, event) {
      var handlers = this.handlers;
      var objHandlers = handlers[id];
      if (objHandlers)
        delete objHandlers[event];
    };
    
    // getHandler
    SynerJ.prototype._getHandler = function (id, event) {
      var handlers = this.handlers;
      return handlers[id][event];
    };

    // getHandlers
    SynerJ.prototype._getHandlers = function (id) {
      var handlers = this.handlers;
      return handlers[id];
    };
    
    // renameHandlers
    SynerJ.prototype._renameHandlers = function (oldId, newId) {
      var handlers = this.handlers[oldId];
      delete this.handlers[oldId];
      this.handlers[newId] = handlers;
    };
    

	return SynerJ;
	})();

  // instantiate shared SynerJ object
  var sObj = new SynerJ(window);
  
  // make client-side SynerJ object that can be either called as
  // a function SynerJ('id') --> SynerJ.get('id')
  // or used as a normal SynerJ object.
  var SynerJ = function (name) {
    return SynerJ.get(name);
  };
  
  // make the shared SynerJ functions accessible through SynerJ.
  SynerJ.constructor.prototype = sObj;
  SynerJ.__proto__ = sObj;

  return SynerJ;
});
