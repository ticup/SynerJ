// shared/SynerJ.core.js
//
// Manages the retrieval/creating and removal of Dobjects.
// Also holds the handlers of the Dobjects.
//
// API:
// - SynerJ._get(id)
// - SynerJ._create(options)
//    options:
//      - type: "DOM element type"
//      - hidden: true/false
// - SynerJ._delete(id)
// - SynerJ._delete(obj)
//
// - SynerJ._treeWalk(parent, fct)
//
// - SynerJ._addHandler(id, name, event)
// - SynerJ._removeHandler(id, name)
// - SynerJ._getHandlers(id)
// - SynerJ._renameHandlers(oldId, newId)
//
// Author: Tim Coppieters
// Date: September 2011

define(['Dobject', 'shared/config'], function(Dobject, cfg) {
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
      this.objectsParent = this._get($('#' + cfg.objectsParent));
    }
	
    SynerJ.prototype.Dobject = Dobject;

    // get
    SynerJ.prototype._get = function (arg) {
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
    SynerJ.prototype._create = function (config) {
      // a normal object = hidden div
      if (!config)
        config = {};
      if (!config.type || config.type == 'none') {
        config.type = 'div';
        config.hidden = 'true';
      }

      // create DOM element
      var $ = this.window.jQuery;
      var domEl = this.document.createElement(config.type);
      var jqEl = $(domEl);
      if (config.hidden)
        jqEl.hide();
      var dobj = this._get(jqEl);

      // set id if given
      if (config.id)
        dobj._id(config.id);

      // insert into tree
      var parent = config.parent;
      if (!parent) {
        config.parentId = config.parentId ||
          ( config.hidden ? cfg.normalObjectsParent : cfg.dobjectsParent );
        parent = this._get(config.parentId);
      }
      if (!Dobject.instanceOf(parent))
        throw "Given parent is not valid config.parentId: " + config.parentId + "; parent: " + parent;
      parent._append(dobj);
      return dobj;
    };

    // delete
    SynerJ.prototype._delete = function (obj) {
      if (typeof obj === 'string')
        obj = this.get(obj);

      if (!Dobject.instanceOf(obj))
        throw "SynerJ.Delete: Expected a Dobject or id of a Dobject, given: " + obj;

      // delete all references to the obj
      this._treeWalk(this.objectsParent, function forEachObject(cObj) {
        if (!cObj.equals(obj)) {
          cObj._forEachProp(function forEachProp(name, val) {
            if (Dobject.instanceOf(val) && val.equals(obj)) {
              cObj._removeProp(name);
            }
          });
        }
      });

      // delete all children
      var children = obj.children();
      for (var i=0; i<children.length; i++) {
        var child = children[i];
        var childId = child.id();
        this._delete(childId);
      }

      // delete the object it's style and jqEl
      deleteStyle(obj);
      obj.jqEl.remove();
    };
    
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

    // treeWalk
    SynerJ.prototype._treeWalk = function (parent, fct) {
      var children = parent.children();
      fct(parent);
      for(var i = 0; i<children.length; i++)
        this._treeWalk(children[i], fct);
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
    // parseObjects: Goes through the DOM tree and initializes
    // the Dobjects. e.g. converting string functions into real functions.
    //SynerJ.prototype.parseObjects = function (parent) {
    //  function parseData(obj) {
    //    var el = obj.jqEl[0];
    //    for (var i = 0; i < el.attributes.length; i++) {
    //      var attr = el.attributes[i];
    //      if (attr.name.indexOf('data-') === 0) {
    //        var name = attr.name.slice(5);
    //        obj._setProp(name, attr.value);
    //      }
    //    }
    //  }
    //  this.treeWalk(parent, parseData);
    //};
    

	return SynerJ;
	})();

	return SynerJ;
});
