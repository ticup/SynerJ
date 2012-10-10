// shared/Dobject.core.js
//
// A Dobject (DOM object) is an object that represents a shared (accross clients/server) object.
// This file sets up the core code for both client and server.
// Core methods are preceded by an underscore, meaning that they only do things locally
// (on the client or the server).
//
// Just like the jQuery library, we don't keep actually keep and manage all the Dobject's
// permanently, because there is already a DOM tree that can do most of the work for us.
// So a Dobject is more of a wrapper around a DOM element, so that actions on that DOM element
// are shared accross server and clients.
//
// This Dobject is further extended in in shared/Dobject.js, where synchronized methods are added,
// which can be used by users, so that they can perform these core methods in context
// of the shared environment.
//
// API (Note: these methods should only be used by internal code, not be users):
// - Dobject.instanceOf(obj)
//
// - Dobject.instanceof(obj)
//
// - obj._id(id)
// - obj._toString()
// - obj._equals(obj2)
//
// - obj._clone()
//
// - obj._tag()
// - obj._tag(newTag)
//
// - obj._setProp(name, val) or obj._prop(name, val)
// - obj._getProp(name) or obj._prop(name)
// - obj._removeProp(name)
// - obj._forEachProp(fct)
// - obj._applyToHasPrototype(fct)
// - obj._chainUp(fct)
// - obj._getInherits()
//
// - obj._attr(name)
// - obj._attr(name, val)
//
// - obj._append(obj)
// - obj._before(obj)
// - obj._after(obj)
// - obj._parent()
//
// - obj._children()
//
// - obj._bind(event, handler)
// - obj._unbind(event)
// - obj._getHandler(name)
// - obj._getHandlers(name)
// - obj._trigger(name)
//
// - obj._value()
// - obj._val()
// - obj._text()
//
// - obj._setCss(name, val)
// - obj._getCss(name)
// - obj._removeCss(name)
// - obj._getStyle()
// - obj._getStyleObject()
// - obj._deleteStyle()
// - obj._getInheritStyleObject()
//
// Author: Tim Coppieters
// Date: September 2011

define(['shared/config', 'shared/css'], function (config, css) {
	var Dobject = (function () {

    // constructor
		function Dobject(jqEl, SynerJ, jQuery) {
      if (!jqEl || !jqEl.length || jqEl.length !== 1)
        throw new Error("new Dobject: must supply a jqEl of length 1" );
      if (!SynerJ || !SynerJ.create)
        throw new Error("new Dobject: must supply a valid SynerJ object");

			this.jqEl = jqEl;
			this.SynerJ = SynerJ;
    }

    // instanceOf: this is necessary, because the user is exposed to the
    // proxyDobject and not this Dobject, so instanceof cannot be used.
    Dobject.instanceOf = function (obj) {
      return (obj instanceof Dobject);
    };

		// id: both setter and getter for the Dobject.
		Dobject.prototype._id = function (id) {
      if (id) {
        validateName(id);
        var oldId = this.id();
        var obj = this.SynerJ(id);
        if (obj)
          throw new Error("id: an object with that id already exists (" + id + ")");
        // update css so it has the new id
        updateCss(this, id);
        // change handlers
        updateHandlers(this, id);
        this.jqEl.attr('id', id);
        return this;
      }
      return this.jqEl.attr('id');
		};
    
    // toString
    Dobject.prototype._toString = function () {
      var id = this.id();
      var str = "object:" + id;
      return str;
    };
    
    // equals: checks if 2 Dobjects are one and the same.
    // The equality check is done by checking if they are wrappers for the same DOM element.
    Dobject.prototype._equals = function equals(obj) {
      return (this.id() === obj.id());
    };

    // tag
    Dobject.prototype._tag = function tag(newTag) {
      return this.jqEl[0].tagName.toLowerCase();
    };

    ///////////
    // clone //
    //////////

    // clone: clone this upon given object.
    Dobject.prototype._clone = function clone(obj) {
       if (!Dobject.instanceOf(obj)) {
         throw new Error('clone: given object is not a valid object: ' + obj);
       }
       // clone properties
       this._forEachProp(function (nam, val) {
         obj._setProp(nam, val);
       });

      // clone css properties
      var style = this._getStyle();
      for (var name in style) {
        obj._css(name, style[name]);
      }

      // clone eventHandlers
      var handlers = this._getHandlers();
      for (var name in handlers) {
        obj._bind(name, handlers[name]);
      }

      // clone attributes
      var attrs = this._attr();
      for (name in attrs) {
        obj._attr(name, attrs[name]);
      }

      // clone children
      var children = obj._children();
      var myChildren = this._children();
      for (var i = 0; i < children.length; i++) {
        myChildren[i]._clone(children[i]);
      }

      return obj;
    };
   
    ////////////////
    // Properties //
    ///////////////

    // prop
    Dobject.prototype._prop = function (name, val) {
      if (typeof val === 'undefined')
        return this._getProp(name);
      return this._setProp(name, val);
    };
    
    // properties which are internally used by the system and thus
    // cannot be used by the users.
    var forbidden_props = ['draggable', 'events'];

    // getProp
    Dobject.prototype._getProp = function (name) {
      // if no name given, return array of all property keys.
      // filter out forbidden_props.
      var res = {};
      if (typeof name === 'undefined') {
        var props = this.jqEl.data();
        for (var prop in props) {
          if (!isForbiddenProp(prop)) {
            res[prop] = props[prop];
          }
        }
        return res;
      }

      // if a name is given, validate it.
      // if none given, an array of all properties will be returned (std jquery op).
      if (name)
        validateName(name);

      // prototype: no chain lookup
      if (name == 'prototype')
        return this.jqEl.data(name);

      // other properties: chain lookup
      return this.chainUp(function prop(obj) {
        var val = obj.jqEl.data(name);
        // this is for a bug on the server-side: if u ask for a none existent prop
        // it will set this prop to ''.
        //if (val === '')
        //  obj.jqEl.removeData(name);
        return val;
      });
    };


		// setProp
    Dobject.prototype._setProp = function (name, val) {
      validateName(name);
      val = parseProperty(val, this.SynerJ);
      // prototype is a special property that defines the prototype chain.
      if (name === 'prototype' && Dobject.instanceOf(val)) {
        checkForCycle(this, val);
        var id = val.id();
        // update css accordingly to new prototype
        css.addRules(this, this.SynerJ.document);
        css.addRules(val, this.SynerJ.document);
        removeInheritCss(this);
        this.jqEl.attr('class', id);
        inheritCss(this, val);
      }
      // set the property in the DOM element.
      this.jqEl.data(name, val);
      return this;
		};
    
    // removeProp
    Dobject.prototype._removeProp = function (name) {
      validateName(name);
      var val = this._getProp(name);
      if (name == 'prototype' && Dobject.instanceOf(val)) {
        var prot = this._getProp('prototype');
        var nam = prot.id();
        removeInheritCss(this);
        this.jqEl.removeClass(nam);
      }
      this.jqEl.removeData(name);
      return this;
    };

    // forEachProp
    Dobject.prototype._forEachProp = function forEachProp(fct) {
      var props = this._getProp();
      for (var name in props) {
        var val = this._getProp(name);
        fct(name, val);
      }
      return this;
    };

    // validateName: helper that checks if given name is a valid id.
    function validateName(name) {
      if (isForbiddenProp(name))
        throw new Error("Cannot use reserved property: " + name);
      if (!name || name === '' || name === ' ')
        throw "Name can't be empty.";
      var reg = /[\w-]+/.exec(name);
      if (!reg)
        throw "Name must be a word: " + name;
      if (reg.index !== 0 || reg[0].length != name.length)
        throw "Name must be a word: " + name;
    }

    // isForbiddenProp: helper that checks if given string
    // is a forbidden property name.
    function isForbiddenProp(name) {
      if (name.match(/jQuery/i))
        return true;
      for (var i = 0; i < forbidden_props.length; i++) {
        var fprop = forbidden_props[i];
        if (name === fprop)
          return true;
      }
      return false;
    }

    // applyToHasPrototype: applies given function to all the objects that have
    // this object in their prototype chain. If the applied function returns false,
    // the propagation stop going further from that parent.
    Dobject.prototype._applyToHasPrototype = function(f) {
      var SynerJ = this.SynerJ;
      var $ = SynerJ.window.jQuery;

      function applyFunction(obj) {
        var inherits = obj._getInherits();
        for (var i = 0; i < inherits.length; i++) {
          var curr = inherits[i];
          var cont = f(curr);
          if (cont)
            applyFunction(curr);
        }
      }

      applyFunction(this);
    };
    
    // chainUp: Execute given function on each object in the chain (bottom->top),
    // until it returns a value
    Dobject.prototype._chainUp = function chainUp(fct) {
      var val;

      function searchInChain(obj) {
          if (!obj)
            return undefined;

          if (obj && Dobject.instanceOf(obj)) {
            // if the fct gives a value, return it
            val = fct(obj);
            if (isValue(val))
              return val;
            
            // oterwhise, keep on searching up the chain
            return searchInChain(obj._getProp('prototype'));
          }
          // end of chain
          return undefined;
      }

      return searchInChain(this);
    };

    // getInherits: returns all the objects that inherit from this object.
    Dobject.prototype._getInherits = function getInherits() {
      var inh = this.SynerJ.window.jQuery('.' + this.id());
      var arr = [];
      for (var i = 0; i < inh.length; i++) {
        arr[i] = this.SynerJ(inh[i]);
      }
      return arr;
    };

    // checkForCycle: checks if setting this prototype makes a cyclic chain.
    function checkForCycle(obj, proto) {
      var visited = [];
      var curr = proto;

      function add(obj) {
        for(var i=0; i<visited.length; i++) {
          var o = visited[i];
          if (obj.equals(o))
            return false;
        }
        visited.push(obj);
        return true;
      }

      while (curr && Dobject.instanceOf(curr)) {
        if (curr._equals(obj))
          throw new Error("Prototype cycle detected.");
        curr = curr._prop('prototype');
      }
    }

    // parseProperty
    function parseProperty(val, SynerJ) {
      // if val == "object:<object id>", get the object and assign that
      // to given name instead of the string.
      if (typeof val == 'string' && val.indexOf('object:') === 0) {
        var id = val.slice(7);
        var obj = SynerJ(id);
        val = obj ? obj : val;
      }

      return val;
    }

  
    ////////////////
    // Attributes //
    ///////////////
    
    // attr
    Dobject.prototype._attr = function (name, val) {
      if (typeof val === 'undefined')
        return getAttr(this, name);
      return setAttr(this, name, val);
    };

    // forbidden attributes for the users
    var forbidden_attrs = ['id', 'class', 'style'];

    // removeAttr
    Dobject.prototype._removeAttr = function (name) {
      // the id and class are reserved attributes.
      if (isForbiddenAttr(name)) {
        throw new Error("removeAttr: forbidden to use the reserved word: " + name);
      }
      this.jqEl.removeAttr(name);
      return this;
    };

    // getAttr
    function getAttr(obj, name) {
      // if no name is given, an array of all attributes is returned.
      if (!name) {
        var attrs = {};
        var attributes = obj.jqEl[0].attributes;
        for (var i = 0; i < attributes.length; i++) {
          var attr = attributes.item(i);
          if (!isForbiddenAttr(attr.nodeName)) {
            attrs[attr.nodeName] = attr.nodeValue;
          }
        }
        return attrs;
      }
      if (isForbiddenAttr(name)) {
        throw new Error("attr: forbidden to use the reserved word: " + name);
      }
      // else return the value of the given attribute.
      return obj.jqEl.attr(name);
    }

    // setAttr
    function setAttr(obj, name, val) {
      // the id and class are reserved attributes.
      if (isForbiddenAttr(name)) {
        throw new Error("attr: forbidden to use the reserved word: " + name);
      }
      // jQuery doesn't allow setting type attributes because of IE troubles...
      if (name == 'type')
        obj.jqEl[0].type = val;
      else
        obj.jqEl.attr(name, val);
      return obj;
    }

    // isForbiddenAttr: helper that checks if given string
    // is a forbidden attr name.
    function isForbiddenAttr(name) {
      for (var i = 0; i < forbidden_attrs.length; i++) {
        var fattr = forbidden_attrs[i];
        if (name === fattr)
          return true;
      }
      return false;
    }
    
    ////////////////////////
    // Tree manipulation //
    //////////////////////

		// append
		Dobject.prototype._append = function (child) {
			// if no children are attached, it might be possible that there
      // is 'text' assigned (innerHTML). Remove this first, because text
      // isn't allowed when the object has children.
      if (this.children().length === 0)
        this.jqEl.empty();
      this.jqEl.append(child.jqEl);
      return this;
		};

    // before
    Dobject.prototype._before = function (obj) {
      this.jqEl.before(obj.jqEl);
      return this;
    };

		// children
		// returns an array of Dobject children.
    Dobject.prototype._children = function () {
      var jqChildArray = this.jqEl.children();
			var childArray = [];
			for (var i = 0; i<jqChildArray.length; i++)
				childArray.push(this.SynerJ.get(jqChildArray[i]));
			return childArray;
		};

    // parent
    Dobject.prototype._parent = function () {
      var parent = this.jqEl.parent();
      return this.SynerJ(parent);
    };


    ////////////////////////
    // DOM element values //
    ///////////////////////

    // text: gets/sets the innerHTML of the DOM element, but only
    // if the Dobject hasn't got any children.
    Dobject.prototype._text = function (text) {
      if (text) {
        if (this._children().length !== 0)
          throw new Error("text: cannot set text when the object has children");
        this.jqEl.html(text);
        return this;
      }
      if (this.children().length !== 0)
        return undefined;
      return this.jqEl.html();
    };

    // value: gets/sets the value of the DOM element.
    Dobject.prototype._val = function (value) {
      if (typeof value === 'undefined')
        return this.jqEl.val();
      this.jqEl.val(value);
      return this;
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

		// unbind
		Dobject.prototype._unbind = function (event) {
      this.jqEl.unbind(event);
      return this;
		};
   
    // getHandler
    Dobject.prototype._getHandler = function (name) {
      var handlers = this._getHandlers();
      return handlers[name];
    };

    // getHandlers
    Dobject.prototype._getHandlers = function () {
      return this.SynerJ._getHandlers(this.id());
    };
    
    /////////
    // CSS //
    ////////

    // css
    Dobject.prototype._css = function css(name, val) {
      if (typeof val === 'undefined')
        return this._getCss(name);
      return this._setCss(name, val);
    };

    // getCss
    Dobject.prototype._getCss = function (name) {
			var style = this._getStyleObject();
      var val = style.getPropertyValue(name);
      // if no property of its own is set, get from inherited style.
      if (!val) {
        style = this._getInheritStyleObject();
        val = style.getPropertyValue(name);
      }
      return val;
    };

		// setCss
		Dobject.prototype._setCss = function (name, val) {
			var style = this._getStyleObject();
			var istyle = this._getInheritStyleObject();
      var oldVal = this._getCss(name);
      // If the user adds one of these 'function attributes' nothing
      // will happen unless a value is given, so we give them a standard value.
      // *if the user adds a new css property through the gui it executes
      // *setCss(<new property>, "")
      if (!val) {
        if (name == 'border')
          val = '1px solid black';
        else if (name == 'margin' || name == 'padding' || name == 'border-radius')
          val = '0px';
        else if (name == 'transition')
          val = 'all 1s ease-in-out';
      }
      style.setProperty(name, val, "");
      istyle.setProperty(name, val, "");
      propagateCss(this, name, val, oldVal);
			return this;
		};

    // removeCss
    Dobject.prototype._removeCss = function (name) {
      var style = this._getStyleObject();
      var istyle = this._getInheritStyleObject();
      var val = this._getCss(name);
      style.removeProperty(name);
      istyle.removeProperty(name);
      /* if inherited style has a value, repropagate it */
      var proto = this._getProp('prototype');
      if (proto && (Dobject.instanceOf(proto))) {
        var pstyle = proto._getInheritStyleObject();
        var pval = pstyle.getPropertyValue(name);
        if (pval) {
          istyle.setProperty(name, pval, "");
          return propagateCss(this, name, pval, val);
        }
      }
      /* otherwise update prototype chain by deleting it */
      this._applyToHasPrototype(function (obj) {
        var mval = obj._getStyle[name];
        /* if current obj has overwritten the property, stop propagation */
        if (mval) {
          return false;
        }
        /* else, propagate removal */
        var mstyle = obj._getInheritStyleObject();
        mstyle.removeProperty(name);
        return true;
      });
         
    };
    
    // getStyle: returns an object which maps the set css properties
    // to their values.
    Dobject.prototype._getStyle = function () {
      var style = this._getStyleObject();
      var selector, value;
      var css = {};
      for (var name in style) {
        if (!isNaN(name)) {
          selector = style[name];
          value = style.getPropertyValue(selector);
          css[selector] = value;
        }
      }

      // support functions as properties such as border and margin
      var props = config.cssProps;
      for (var i=0; i<props.length; i++) {
        selector = props[i];
        value = style.getPropertyValue(selector);
        if (value)
          css[selector] = value;
      }
      return css;
    };
    
    // getStyleObject: returns the CSSOM style object of this object.
    Dobject.prototype._getStyleObject = function () {
      var id = this.id();
      var document = this.SynerJ.document;
      var name = "#" + id;
      return css.getStyle(name, document);
    };

    // getInheritStyleObject: returns the CSSOM style object that implements the
    // inherited style.
    Dobject.prototype._getInheritStyleObject = function () {
      var id = this.id();
      var document = this.SynerJ.document;
      var name = "." + id;
      return css.getStyle(name, document);
    };

    // updateHandlers: updates the handlers for the new id
    function updateHandlers(obj, id) {
      obj.SynerJ._renameHandlers(obj.id(), id);
    }


    // inherit css: update the inherited style so it inherits from given prototype.
    function inheritCss(obj, prot) {
      var SynerJ = obj.SynerJ;
      var style = prot._getInheritStyleObject();
      var mstyle = obj._getInheritStyleObject();
      for (var name in style) {
        if (!isNaN(name)) {
          var selector = style[name];
          var value = style.getPropertyValue(selector);
          var mvalue = mstyle.getPropertyValue(selector);
          if (!mvalue || mvalue === '' || mvalue === ' ') {
            mstyle.setProperty(selector, value, "");
          }
        }
      }
    }

    // updateCss: updates the CSSOM object so it has the correct id
    // This must be executed before the object has changed its id
    function updateCss(obj, id) {
      var oname = "#" + obj.id();
      var nname = "#" + id;
      var doc = obj.SynerJ.document;
      css.renameRule(doc, oname, nname);
      oname = "." + obj.id();
      nname = "." + id;
      css.renameRule(doc, oname, nname);
    }
    
    // propagateCss: updates the objects that have this object as prototype.
    function propagateCss(obj, name, val, oldVal) {
      var SynerJ = obj.SynerJ;
      obj._applyToHasPrototype(function (obj) {
        var style = obj._getStyleObject();
        var istyle = obj._getInheritStyleObject();
        var oval = style.getPropertyValue(name);
        // if this object has overwritten the value, stop propagation.
        if (oval)
          return false;
        if (!val || val === "")
          istyle.removeProperty(name, "");
        else
          istyle.setProperty(name, val, "");
        return true;
      });
    }

    function isValue(val) {
      return (typeof val != 'undefined' && !(typeof val === 'string' && val === ''));
    }

    // removeInheritCss: Remove the style inherited through the prototype.
    function removeInheritCss(obj) {
        var SynerJ = obj.SynerJ;
        var style = obj._getStyleObject();
        var istyle = obj._getInheritStyleObject();
        for (var name in istyle) {
          if (!isNaN(name)) {
            var selector = istyle[name];
            var value = istyle.getPropertyValue(selector);
            var mvalue = style.getPropertyValue(selector);
            // this object doesn't have a value for the selector,
            // delete the inherited value for all objects in this chain.
            if (!mvalue) {
              istyle.removeProperty(selector, "");
              propagateCss(obj, selector, "", value);
            // this object has a different value then the inherited value,
            // reset the css value so objects in the chain get his value as inherited value.
            } else if (value != mvalue) {
              obj._setCss(selector, mvalue);
            }
            // else the value in the inherited comes from this object,
            // nothing has to be done.
          }
        }
    }

    return Dobject;
	})();
  return Dobject;
});
