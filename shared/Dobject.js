// shared/Dobject.js
//
// This provides the Dobject object with synchronized methods.
// These methods are used by the user (either executed directly on the server or on the client)
// and make sure that the core methods are executed on both server and all connected clients.
//
// The main method used is SynerJ.sync, which should be implemented both on the server as
// on the client version of the SynerJ object.
//
// API:
// - Dobject.instanceOf(obj)
//
// - obj.id(id)
// - obj.toString()
// - obj.equals(obj2)
//
// - obj.tag()
// - obj.tag(newTag)
//
// - obj.clone(obj)
//
// - obj.setProp(name, val) or obj.prop(name, val)
// - obj.getProp(name) or obj.prop(name)
// - obj.removeProp(name)
// - obj.forEachProp(fct)
//
// - obj.attr(name)
// - obj.attr(name, val)
//
// - obj.append(obj)
// - obj.before(obj)
// - obj.after(obj)
// - obj.parent()
// - obj.getInherits()
// - obj.children()
// - obj.applyToHasPrototype(fct)
// - obj.chainUp(fct)
//
// - obj.bind(event, handler)
// - obj.unbind(event)
// - obj.getHandler(name)
// - obj.trigger(name)
//
// - obj.val()
// - obj.text()
//
// - obj.setCss(name, val)
// - obj.getCss(name)
// - obj.removeCss(name)
// - obj.getStyle()
// - obj.getStyleObject()
// - obj.getInheritStyleObject()
//
// Author: Tim coppieters
// Date: September 2011

define(['shared/Dobject.core'], function (Dobject) {
  
  // id
  Dobject.prototype.id = function (id, callback) {
    if (id)
      return this.SynerJ.sync('id', { id: this.id(), newId: id }, callback);
    return this._id();
  };
  
  // toString
  Dobject.prototype.toString = Dobject.prototype._toString;

  // equals
  Dobject.prototype.equals = Dobject.prototype._equals;

  // tag
  Dobject.prototype.tag = Dobject.prototype._tag;

  // clone
  Dobject.prototype.clone = function clone(newObj) {
    var id = newObj && newObj.id();
    this.SynerJ.sync('clone', { id: this.id(), newId: id });
  };

  // prop
  Dobject.prototype.prop = function prop(name, val) {
    if (typeof val === 'undefined')
      return this.getProp(name);
    return this.setProp(name, val);
  };
  
	// setProp
  Dobject.prototype.setProp = function (name, val, callback) {
    if (typeof val === 'object')
      val = val.toString();
    if (typeof val === 'function')
      val = val.toString();
    this.SynerJ.sync('setProp', { id: this.id(), name: name, val: val }, callback);
  };
	
  // getProp
  Dobject.prototype.getProp = function (name) {
    return this._getProp(name);
  };
  
  // removeProp
	Dobject.prototype.removeProp = function (name, callback) {
		this.SynerJ.sync('removeProp', { id: this.id(), name: name }, callback);
	};
  
  // forEachProp
  Dobject.prototype.forEachProp = Dobject.prototype._forEachProp;

  // val
  Dobject.prototype.val = Dobject.prototype._val;

  // text
  Dobject.prototype.text = function (text, callback) {
    if (text)
      this.SynerJ.sync('text', { id: this.id(), text: text }, callback);
    return this._text();
  };

  // attr
  Dobject.prototype.attr = function (name, val) {
    if (typeof val === 'undefined')
      return this._attr(name);
    this.SynerJ.sync('attr', { id: this.id(), name: name, val: val });
  };
  
  // removeAttr
  Dobject.prototype.removeAttr = function (name, callback) {
    this.SynerJ.sync('removeAttr', { id: this.id(), name: name });
  };

	// append
  Dobject.prototype.append = function (child, callback) {
		var parentId = this.id();
		var childId = child.id();
		this.SynerJ.sync('append', { id: parentId, childId: childId }, callback);
	};
  
  // before
  Dobject.prototype.before = function (obj, callback) {
    var objId = obj.id();
    var id = this.id();
    this.SynerJ.sync('before', { rId: id, lId: objId }, callback);
  };
	
  // bind
	Dobject.prototype.bind = function (event, handler, callback) {
		var id = this.id();
		var handlerString = (typeof handler === 'function') ? handler.toString() : handler;
		this.SynerJ.sync('bind', { id: id, event: event, handler: handlerString }, callback);
	};

	// unbind
	Dobject.prototype.unbind = function (event, callback) {
		var id = this.id();
		this.SynerJ.sync('unbind', { id: id, event: event }, callback);
	};
  
  // trigger
  Dobject.prototype.trigger = function (event) {
    this.SynerJ.sync('trigger', { id: this.id(), event: event });
  };

  // getHandler
  Dobject.prototype.getHandler = Dobject.prototype._getHandler;

  // css
  Dobject.prototype.css = function (name, val, callback) {
    if (typeof val === 'undefined')
      return this.getCss(name, callback);
    return this.setCss(name, val, callback);
  };

	// setCss
  Dobject.prototype.setCss = function (name, val, callback) {
		this.SynerJ.sync('setCss', { id: this.id(), name: name, val: val }, callback);
	};
  
  // getCss
  Dobject.prototype.getCss = function (name) {
    return this._getCss(name);
  };
	
  // removeCss
  Dobject.prototype.removeCss = function (name) {
    this.SynerJ.sync('removeCss', { id: this.id(), name: name });
  };

  // getStyle
	Dobject.prototype.getStyle = Dobject.prototype._getStyle;

  // getStyleObject
	Dobject.prototype.getStyleObject = Dobject.prototype._getStyleObject;
  
  // children
  Dobject.prototype.children = Dobject.prototype._children;
  
  // parent
  Dobject.prototype.parent = Dobject.prototype._parent;

  // chainUp
  Dobject.prototype.chainUp = Dobject.prototype._chainUp;

  // applyToHasPrototype
  Dobject.prototype.applyToHasPrototype = Dobject.prototype._applyToHasPrototype;
  
  return Dobject;
});
