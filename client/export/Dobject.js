// client/export/Dobject.js
//
// This version of the Dobject is used to come along with exported applications.
// It contains all the core code, but under the form of the sync API.
// This makes it possible to use the same code in a synced environment
// in a stand-alone environment.
//
// - Dobject.instanceOf(obj)
//
// - obj.id(id)
// - obj.toString()
// - obj.equals(obj2)
// 
// - obj.clone()
//
// - obj.tag()
// - obj.tag(newTag)
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
// - obj.getHandlers(name)
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
// - obj.deleteStyle()
// - obj.getInheritStyleObject()
//
// Author: Tim Coppieters
// Date: September 2011

define(['config'], function (config) {
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
		Dobject.prototype.id = function (id) {
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
    Dobject.prototype.toString = function () {
      var id = this.id();
      var str = "object:" + id;
      return str;
    };
    
    // equals: checks if 2 Dobjects are one and the same.
    // The equality check is done by checking if they are wrappers for the same DOM element.
    Dobject.prototype.equals = function equals(obj) {
      return (this.id() === obj.id());
    };

    // tag
    Dobject.prototype.tag = function tag(newTag) {
      return this.jqEl[0].tagName.toLowerCase();
    };

    ///////////
    // clone //
    //////////

    // clone: clone this upon given object.
    Dobject.prototype.clone = function clone() {
      var SynerJ = this.SynerJ;
      // create fresh objects for the clones
      var newObj = SynerJ.create({type: this._tag(), parent: this._parent()});

      function makeChildren(obj, parent) {
        var children = obj.children();
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          var newObj = SynerJ.create({type: child._tag(), parent: parent});
          makeChildren(child, newObj);
        }
      }

      makeChildren(this, newObj);

       // clone properties
       this.forEachProp(function (nam, val) {
         obj[nam] = val;
       });

      // clone css properties
      var style = this.getStyle();
      for (var name in style) {
        obj.css(name, style[name]);
      }

      // clone eventHandlers
      var handlers = this.getHandlers();
      for (name in handlers) {
        obj.bind(name, handlers[name]);
      }

      // clone attributes
      var attrs = this.attr();
      for (name in attrs) {
        obj.attr(name, attrs[name]);
      }

      // clone children
      var children = obj.children();
      var myChildren = this.children();
      for (var i = 0; i < children.length; i++) {
        myChildren[i].clone(children[i]);
      }

      return obj;
    };
   
    ////////////////
    // Properties //
    ///////////////

    // prop
    Dobject.prototype.prop = function (name, val) {
      if (typeof val === 'undefined')
        return this.getProp(name);
      return this.setProp(name, val);
    };
    
    // properties which are internally used by the system and thus
    // cannot be used by the users.
    var forbidden_props = ['draggable', 'events'];

    // getProp
    Dobject.prototype.getProp = function (name) {
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

    // call
    Dobject.prototype.call = function (name, val) {
      var args = argsArray(arguments).slice(1);
      var fct = this.getProp(name);
      if (typeof fct === 'function') {
        return fct.call(this, args);
      } else
        throw({ name: 'ArgumentError', message: "Error: " + name + " is not a function" });
    };

		// setProp
    Dobject.prototype.setProp = function (name, val) {
      validateName(name);
      val = parseProperty(val, this.SynerJ);
      // prototype is a special property that defines the prototype chain.
      if (name === 'prototype' && Dobject.instanceOf(val)) {
        checkForCycle(this, val);
        var id = val.id();
        // update css accordingly to new prototype
        removeInheritCss(this);
        this.jqEl.attr('class', id);
        inheritCss(this, val);
      }
      // set the property in the DOM element.
      this.jqEl.data(name, val);
      return this;
		};
    
    // removeProp
    Dobject.prototype.removeProp = function (name) {
      validateName(name);
      var val = this.getProp(name);
      if (name == 'prototype' && Dobject.instanceOf(val)) {
        var prot = this.getProp('prototype');
        var nam = prot.id();
        removeInheritCss(this);
        this.jqEl.removeClass(nam);
      }
      this.jqEl.removeData(name);
      return this;
    };

    // forEachProp
    Dobject.prototype.forEachProp = function forEachProp(fct) {
      var props = this.getProp();
      for (var name in props) {
        var val = this.getProp(name);
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
  
    ////////////////
    // Attributes //
    ///////////////
    
    // attr
    Dobject.prototype.attr = function (name, val) {
      if (typeof val === 'undefined')
        return getAttr(this, name);
      return setAttr(this, name, val);
    };

    // forbidden attributes for the users
    var forbidden_attrs = ['id', 'class', 'style'];

    // removeAttr
    Dobject.prototype.removeAttr = function (name) {
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
    
    ///////////////
    // Structure //
    //////////////

		// append
		Dobject.prototype.append = function (child) {
			// if no children are attached, it might be possible that there
      // is 'text' assigned (innerHTML). Remove this first, because text
      // isn't allowed when the object has children.
      if (this.children().length === 0)
        this.jqEl.empty();
      this.jqEl.append(child.jqEl);
      return this;
		};

    // before
    Dobject.prototype.before = function (obj) {
      this.jqEl.before(obj.jqEl);
      return this;
    };

		// children
		// returns an array of Dobject children.
    Dobject.prototype.children = function () {
      var jqChildArray = this.jqEl.children();
			var childArray = [];
			for (var i = 0; i<jqChildArray.length; i++)
				childArray.push(this.SynerJ.get(jqChildArray[i]));
			return childArray;
		};

    // parent
    Dobject.prototype.parent = function () {
      var parent = this.jqEl.parent();
      return this.SynerJ(parent);
    };

    // applyToHasPrototype: applies given function to all the objects that have
    // this object in their prototype chain. If the applied function returns false,
    // the propagation stop going further from that parent.
    Dobject.prototype.applyToHasPrototype = function(f) {
      var SynerJ = this.SynerJ;
      var $ = SynerJ.window.jQuery;

      function applyFunction(obj) {
        var inherits = obj.getInherits();
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
    Dobject.prototype.chainUp = function chainUp(fct) {
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
            return searchInChain(obj.getProp('prototype'));
          }
          // end of chain
          return undefined;
      }

      return searchInChain(this);
    };

    // getInherits: returns all the objects that inherit from this object.
    Dobject.prototype.getInherits = function getInherits() {
      var inh = this.SynerJ.window.jQuery('.' + this.id());
      var arr = [];
      for (var i = 0; i < inh.length; i++) {
        arr[i] = this.SynerJ(inh[i]);
      }
      return arr;
    };

    ////////////////////////
    // DOM element values //
    ///////////////////////

    // text: gets/sets the innerHTML of the DOM element, but only
    // if the Dobject hasn't got any children.
    Dobject.prototype.text = function (text) {
      if (text) {
        if (this.children().length !== 0)
          throw new Error("text: cannot set text when the object has children");
        this.jqEl.html(text);
        return this;
      }
      if (this.children().length !== 0)
        return undefined;
      return this.jqEl.html();
    };

    // value: gets/sets the value of the DOM element.
    Dobject.prototype.val = function (value) {
      if (typeof value === 'undefined')
        return this.jqEl.val();
      this.jqEl.val(value);
      return this;
    };

    ////////////////////
    // Event Handlers //
    ////////////////////

    // bind
    Dobject.prototype.bind = function (event, handler) {
      var obj = this;
      this.SynerJ._addHandler(this, event, handler);
      this.jqEl.unbind(event);
      this.jqEl.bind(event, function (e) {
        obj.trigger(event);
      });
      return this;
    };

		// unbind
		Dobject.prototype.unbind = function (event) {
      this.SynerJ._removeHandler(this, event);
      this.jqEl.unbind(event);
      return this;
		};
    
    // trigger
    Dobject.prototype.trigger = function (event) {
      var args = argsArray(arguments).slice(1);
      args.unshift(event);
      var handler = this.getHandler(event);
      if (handler)
        handler.apply(this, args);
    };

    function argsArray(obj) {
      var args = [];
      for (var i=0; i<obj.length; i++)
        args.push(obj[i]);
      return args;
    }

    // getHandler
    Dobject.prototype.getHandler = function (name) {
      var SynerJ = this.SynerJ;
      return this.chainUp(function getHandler(obj) {
        var handler = SynerJ._getHandler(obj, name);
        if (!handler)
          return undefined;
        return handler;
      });
    };

    // getHandlers
    Dobject.prototype.getHandlers = function () {
      return this.SynerJ._getHandlers(this.id());
    };


    /////////
    // CSS //
    ////////

    // css
    Dobject.prototype.css = function css(name, val) {
      if (typeof val === 'undefined')
        return this.getCss(name);
      return this.setCss(name, val);
    };

    // getCss
    Dobject.prototype.getCss = function (name) {
			var style = this.getStyleObject();
      var val = style.getPropertyValue(name);
      // if no property of its own is set, get from inherited style.
      if (!val) {
        style = this.getInheritStyleObject();
        val = style.getPropertyValue(name);
      }
      return val;
    };

		// setCss
		Dobject.prototype.setCss = function (name, val) {
			var style = this.getStyleObject();
			var istyle = this.getInheritStyleObject();
      var oldVal = this.getCss(name);
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
    Dobject.prototype.removeCss = function (name) {
      var style = this.getStyleObject();
      var istyle = this.getInheritStyleObject();
      var val = this.getCss(name);
      style.removeProperty(name);
      istyle.removeProperty(name);
      /* if inherited style has a value, repropagate it */
      var proto = this.getProp('prototype');
      if (proto && (Dobject.instanceOf(proto))) {
        var pstyle = proto.getInheritStyleObject();
        var pval = pstyle.getPropertyValue(name);
        if (pval) {
          istyle.setProperty(name, pval, "");
          return propagateCss(this, name, pval, val);
        }
      }
      /* otherwise update prototype chain by deleting it */
      this.applyToHasPrototype(function (obj) {
        var mval = obj.getStyle[name];
        /* if current obj has overwritten the property, stop propagation */
        if (mval) {
          return false;
        }
        /* else, propagate removal */
        var mstyle = obj.getInheritStyleObject();
        mstyle.removeProperty(name);
        return true;
      });
         
    };
    
    // getStyle: returns an object which maps the set css properties
    // to their values.
    Dobject.prototype.getStyle = function () {
      var style = this.getStyleObject();
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
    Dobject.prototype.getStyleObject = function () {
      var id = this.id();
      var document = this.SynerJ.document;
      var name = "#" + id;
      return getStyle(name, document);
    };

    // getInheritStyleObject: returns the CSSOM style object that implements the
    // inherited style.
    Dobject.prototype.getInheritStyleObject = function () {
      var id = this.id();
      var document = this.SynerJ.document;
      var name = "." + id;
      return getStyle(name, document);
    };

    // updateHandlers: updates the handlers for the new id
    function updateHandlers(obj, id) {
      obj.SynerJ.renameHandlers(obj.id(), id);
    }


    // inherit css: update the inherited style so it inherits from given prototype.
    function inheritCss(obj, prot) {
      var SynerJ = obj.SynerJ;
      var style = prot.getInheritStyleObject();
      var mstyle = obj.getInheritStyleObject();
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
    // This must be executed after the object has changed its id
    function updateCss(obj, id) {
        var oname = "#" + obj.id();
        var nname = "#" + id;
        var doc = obj.SynerJ.document;
        renameRule(doc, oname, nname);
    }
    
    // propagateCss: updates the objects that have this object as prototype.
    function propagateCss(obj, name, val, oldVal) {
      var SynerJ = obj.SynerJ;
      obj.applyToHasPrototype(function (obj) {
        var style = obj.getStyleObject();
        var istyle = obj.getInheritStyleObject();
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

    // checkForCycle: checks if setting this prototype makes an cyclic chain.
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
        if (curr.equals(obj))
          throw new Error("Prototype cycle detected.");
        curr = curr.prop('prototype');
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

    function isValue(val) {
      return (typeof val != 'undefined' && !(typeof val === 'string' && val === ''));
    }
    
    //
    // CSSOM helpers
    //
    
    // findRule
		function findRule(document, name) {
			// some browsers don't support upperCase in selectorTexts.
      var sheet = document.styleSheets[1];
      var rules = sheet.cssRules;
			var lowrName = name.toLowerCase();
			for (var i = 0; i<rules.length; i++) {
				if (rules[i].selectorText.toLowerCase() == lowrName)
					return rules[i];
			}
			return undefined;
		}
    
    // renameRule
    function renameRule(document, oname, nname) {
      var newName = nname.toLowerCase();
      var oldName = oname.toLowerCase();
      var sheet = document.styleSheets[1];
      var rules = sheet.cssRules;
			for (var i = 0; i<rules.length; i++) {
        if (rules[i].selectorText.toLowerCase() == oldName) {
          var style = rules[i].style;
          var rule = nname;
          if (style.cssText)
            rule += " { " + style.cssText + " } ";
          else
            rule += style.toString();
          sheet.deleteRule ? sheet.deleteRule(i) : sheet.removeRule(i);
          sheet.insertRule ? sheet.insertRule(rule, rules.length) : sheet.addRule(rule, rules.length);
        }
      }
    }
      
    // findStyle
		function findStyle(document, name) {
      var rule = findRule(document, name);
      if (rule)
        return rule.style;
      return undefined;
    }

    // serializeSelector: certain browsers only accept score-separated
    // selectors, others camelCase.
    function serializeSelector(selector, window) {
      /* server-side code */
      if (!window.navigator)
        return selector;
      /* firefox */
      if (navigator.userAgent.match(/mozilla/gi)) {
        var els = selector.split('-');
        for (var i=1; i<els.length; i++) {
          var str = els[i];
          els[i] = str.charAt(0).toUpperCase() + str.slice(1);
        }
        return els.join('');
      }
      /* others */
      return selector;
    }

		// getStyle: Gets the style object with given name
    function getStyle(name, document) {
			// convention is that the id's sheet is at 1
			var sheet = document.styleSheets[1];
			var rules = sheet.cssRules;
			var rule = name + "{}";
      var style = findStyle(document, name);
			// if the style already exists, just return it
			if (style)
				return style;
			// otherwise add a rule which includes the style.
			if (sheet.insertRule)
				sheet.insertRule(rule, rules.length);
			else if (sheet.addRule)
				sheet.addRule(rule, rules.length);
			else
				throw new Error("Browser doesn't support adding rules");
			return findStyle(document, name);
		}

    // removeInheritCss: Remove the style inherited through the prototype.
    function removeInheritCss(obj) {
        var SynerJ = obj.SynerJ;
        var style = obj.getStyleObject();
        var istyle = obj.getInheritStyleObject();
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
              obj.setCss(selector, mvalue);
            }
            // else the value in the inherited comes from this object,
            // nothing has to be done.
          }
        }
    }
    return Dobject;
	})();

  // create a proxy for the Dobject object so that properties can be accessed,
  // set and executed through the dot operator.
  function dobjectHandler(obj) {
    this.obj = obj;
  }

  dobjectHandler.prototype = {
    has: function (nam) {
      return !!this.obj.getProp(nam);
    },
    get: function (rcvr, nam) {
      // TODO: perform a more thorough check here. This should filter all the standard
      // property values.
      if (nam == 'prototype' || nam == 'constructor')
        return this.obj.getProp(nam);

      // check if nam is a function defined by the Dobject prototype
      var val = this.obj[nam];

      // if not, get the property using getProp
      if (!val)
        val = this.obj.getProp(nam);

      return val;
    },
    set: function (rcvr, nam, val) {
      return this.obj.setProp(nam, val);
    },
    delete: function (nam) {
      return this.obj.removeProp(nam);
    },
    enumerate: function () {
      var nams = [];
      var props = this.obj.getProp();
      for (var nam in props) { nams.push(nam); }
      return nams;
    },
    keys: function () {
      return Object.keys(this.obj.getProp());
    }
  };

  var ProxyDobject = function ProxyDobject(config, SynerJ) {
    var obj = new Dobject(config, SynerJ);
    
    return Proxy.create(new dobjectHandler(obj), Object.getPrototypeOf(obj));
  };

  //ProxyDobject.instanceOf = function instanceOf(obj) {
  //  return obj instanceof Dobject;
  //};

return ProxyDobject;
});
