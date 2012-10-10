var define = require('requirejs');
var should = require('should');

define.config({
	baseUrl: __dirname + '/../',
	//nodeRequire: require,
	paths: {
		Dobject: 'lib/env/Dobject',
    SynerJ: 'lib/env/SynerJ',
    eventHandlers: 'lib/env/eventHandlers'
  }
});

define(['lib/server/Page'], function (Page) {
	new Page('test', function tests(page) {
		var window = page.window;
		var document = page.document;
		var SynerJ = window.SynerJ;
		var $ = window.jQuery;
		var jqEl = $('<div>');
		var Dobject = SynerJ.Dobject;

		describe('new Dobject():', function () {
			describe('new Dobject()', function () {
				it('should throw an error', function () {
					(function () {
						new Dobject();
					}).should.throw("new Dobject: must supply a jqEl of length 1");
				});
			});
			describe('new Dobject(jqEl)', function () {
				it('should throw an error', function () {
					(function () {
						new Dobject(jqEl);
					}).should.throw("new Dobject: must supply a valid SynerJ object");
				});
			});
			describe('new Dobject(jqEl, SynerJ)', function () {
				var obj = new Dobject(jqEl, SynerJ);
				it('should return a Dobject', function () {
					Dobject.instanceOf(obj).should.be.true;
				});

				it('should be a Dobject that wraps given jqEl', function() {
					obj.should.have.property('jqEl', jqEl);
				});

				it('should be a Dobject in context of given SynerJ object', function() {
					obj.should.have.property('SynerJ', SynerJ);
				});
			});
		});

		describe('methods:', function () {
			var obj = SynerJ.create();
			var jqEl = obj.jqEl;
			var child = SynerJ.create();
			var child2 = SynerJ.create();
			var parent = SynerJ.create();

			describe('._id()', function () {
				it('should return the id of the wrapped jqEl', function () {
					obj._id().should.equal(jqEl.attr('id'));
				});
			});

			describe('._id(newId)', function () {
				it('should change the id of the wrapped jqEl', function () {
					obj._id('newID');
					obj._id().should.equal('newID');
				});
			});

			describe('._toString()', function () {
				it('should return "dobject:<id>"', function () {
					obj._toString().should.equal('object:' + obj.id());
				});
			});

			describe('._equals(obj)', function () {
				it('should return true if given obj wraps the same jqEl', function () {
					var obj2 = new Dobject(jqEl, SynerJ);
					obj._equals(obj2).should.be.true;
				});
			});

			describe('._tag()', function () {
				it('should return the tag value of the jqEl', function () {
					obj.tag().should.equal('div');
					obj._attr('foo').should.equal(obj.jqEl.attr('foo'));
				});
			});


			describe('._clone(obj)', function () {
				var cloned = SynerJ.create();
				it('should return the cloned object', function () {
					var newObj = obj._clone(cloned);
					newObj._equals(cloned).should.be.true;
				});
				it('should copy all the properties to it', function () {
					obj._prop('foo', 'bar');
					obj._prop('bar', 'foo');
					obj._clone(cloned);
					should.equal(cloned.foo, 'bar');
					should.equal(cloned.bar, 'foo');
				});
				it('should copy all the attributes to it', function () {
					obj._attr('foo', 'bar');
					obj._attr('bar', 'foo');
					obj._clone(cloned);
					should.equal(cloned.attr('foo'), 'bar');
					should.equal(cloned.attr('bar'), 'foo');
				});
				it('should copy all the css properties to it', function () {
					obj._css('width', '200px');
					obj._css('height', '100px');
					obj._clone(cloned);
					should.equal(cloned._css('width'), '200px');
					should.equal(cloned._css('height'), '100px');
				});
				it('should copy all the eventHandlers to it', function () {
					obj._bind('click', function () { return 'foo'; });
					obj._bind('foo', function () { return 'bar'; });
					obj._clone(cloned);
					should.equal(cloned._getHandler('click')(), 'foo');
					should.equal(cloned._getHandler('foo')(), 'bar');
				});
			});


/////////////////
// Properties //
///////////////

describe('._prop(name)', function () {
	it('should return the value of the data property', function () {
		obj.jqEl.data('foo', 'bar');
		obj._prop('foo').should.equal(obj.jqEl.data('foo'));
	});
	it('should throw error for reserved properties', function () {
		(function () {
			obj._prop('draggable');
		}).should.throw('Cannot use reserved property: draggable');
		(function () {
			obj._prop('events');
		}).should.throw('Cannot use reserved property: events');
	});
});

describe('._prop()', function () {
	it('should return an object with properties', function () {
		obj._prop('foo', 'bar');
		obj._prop('bar', 'foo');
		var props = obj._prop();
		props.foo.should.equal('bar');
		props.bar.should.equal('foo');
		Object.keys(props).should.have.lengthOf(2);
	});
	it('should throw error for reserved properties', function () {
		(function () {
			obj._prop('draggable');
		}).should.throw('Cannot use reserved property: draggable');
		(function () {
			obj._prop('events');
		}).should.throw('Cannot use reserved property: events');
	});
});

describe('._prop(name, val)', function () {
	var res;
	it('should set the value of the data property', function () {
		res = obj._prop('foo', 'bart');
		obj._prop('foo').should.equal('bart');
		obj._prop('foo').should.equal(obj.jqEl.data('foo'));
	});
	it('should throw error for reserved properties', function () {
		(function () {
			obj._prop('draggable', 'foo');
		}).should.throw('Cannot use reserved property: draggable');
		(function () {
			obj._prop('events', 'foo');
		}).should.throw('Cannot use reserved property: events');
	});
	it('should return the Dobject', function () {
		res._equals(obj).should.be.true;
	});
});

describe('._removeProp(name)', function () {
	var res;
	it('should remove the property', function () {
		obj._prop('foo', 'bart');
		res = obj._removeProp('foo');
		should.not.exist(obj._prop('foo'));
	});
	it('should throw error for reserved properties', function () {
		(function () {
			obj._removeProp('draggable');
		}).should.throw('Cannot use reserved property: draggable');
		(function () {
			obj._removeProp('events');
		}).should.throw('Cannot use reserved property: events');
	});
	it('should return the Dobject', function () {
		res._equals(obj).should.be.true;
	});
});

describe('._forEachProp(name)', function () {
	var props = {};
	var res;
	it('should apply function to each property', function () {
		obj._prop('foo', 1);
		obj._prop('bar', 2);
		obj._prop('foobar', 3);
		res = obj._forEachProp(function (nam, val) {
			props[nam] = val;
		});
		props['foo'].should.equal(1);
		props['bar'].should.equal(2);
		props['foobar'].should.equal(3);
	});
	it('should return the Dobject', function () {
		res._equals(obj).should.be.true;
	});
});



////////////////
//Attributes //
//////////////

describe('._attr(name)', function () {
	it('should return the value of the attribute', function () {
		obj.jqEl.attr('foo', 'bar');
		obj._attr('foo').should.equal(obj.jqEl.attr('foo'));
	});
	it('should throw error for reserved attributes', function () {
		(function () {
			obj._attr('id');
		}).should.throw("attr: forbidden to use the reserved word: id");
		(function () {
			obj._attr('class');
		}).should.throw("attr: forbidden to use the reserved word: class");
		(function () {
			obj._attr('style');
		}).should.throw("attr: forbidden to use the reserved word: style");
	});
});

describe('._attr()', function () {
	it('should return an object mapping attribute names to values', function () {
		obj._attr('foo', 'bar');
		obj._attr('bar', 'foo');
		var attrs = obj._attr();
		attrs.foo.should.equal('bar');
		attrs.bar.should.equal('foo');
		Object.keys(attrs).should.have.lengthOf(2);
	});
});

describe('._attr(name, val)', function () {
	var res;
	it('should set the value of the attribute', function () {
		res = obj._attr('foo', 'bart');
		obj._attr('foo').should.equal('bart');
	});
	it('should throw error for reserved attributes', function () {
		(function () {
			obj._attr('class', 'foo');
		}).should.throw("attr: forbidden to use the reserved word: class");
		(function () {
			obj._attr('id', 'foo');
		}).should.throw("attr: forbidden to use the reserved word: id");
		(function () {
			obj._attr('style', 'foo');
		}).should.throw("attr: forbidden to use the reserved word: style");
	});
	it('should return the Dobject', function () {
		res._equals(obj).should.be.true;
	});
});

describe('._removeAttr(name)', function () {
	var res;
	it('should remove the value of the attribute', function () {
		res = obj._removeAttr('foo');
		obj._attr('foo').should.equal('');
	});
	it('should throw error for reserved attributes', function () {
		(function () {
			obj._removeAttr('class');
		}).should.throw("removeAttr: forbidden to use the reserved word: class");
		(function () {
			obj._removeAttr('style');
		}).should.throw("removeAttr: forbidden to use the reserved word: style");
		(function () {
			obj._removeAttr('id');
		}).should.throw("removeAttr: forbidden to use the reserved word: id");
	});
	it('should return the Dobject', function () {
		res._equals(obj).should.be.true;
	});
});


////////////////////////
// Tree manipulation //
//////////////////////

describe('._append(child)', function () {
	var res;
	it('should append the child to the jqEl in the DOM tree', function () {
		res = obj._append(child);
		obj._children().should.include.child;
	});
	it('should return the Dobject', function () {
		res._equals(obj).should.be.true;
	});
});

describe('._before(child)', function () {
	var res;
	it('should put given object before target object in the DOM tree', function () {
		parent._append(obj);
		res = obj._before(child);
		parent._children()[0]._equals(child).should.be.true;
	});
	it('should return the Dobject', function () {
		res._equals(obj).should.be.true;
	});
});

describe('._parent()', function () {
	it('should return the parent of target object', function () {
		parent._append(child);
		child._parent()._equals(parent).should.be.true;
		page.save();
	});
});

describe('._applyToHasPrototype(fct)', function () {
	var res;
	var arr = [];
	it('should apply function to all objects that have this object as prototype', function () {
		child._prop('prototype', parent);
		child2._prop('prototype', parent);
		obj._prop('prototype', child);
		parent._applyToHasPrototype(function (curr) {
			arr.push(curr.id());
			return true;
		});
		arr.should.include(child2.id());
		arr.should.include(child.id());
		arr.should.include(obj.id());
		arr.should.have.lengthOf(3);
	});
	it('should stop propagating down if false is returned', function () {
		arr = [];
		parent._applyToHasPrototype(function (curr) {
			arr.push(curr.id());
			if (curr._equals(child))
				return false;
			return true;
		});
		arr.should.include(child2.id());
		arr.should.include(child.id());
		arr.should.have.lengthOf(2);
	});
});

describe('._chainUp(fct)', function () {
	var res;
	var arr = [];
	it('should apply fct to all ancestors in prototype chain (this incl.)', function () {
		child._prop('prototype', parent);
		child2._prop('prototype', parent);
		obj._prop('prototype', child);
		obj._chainUp(function (curr) {
			arr.push(curr.id());
		});
		arr.should.include(parent.id());
		arr.should.include(child.id());
		arr.should.include(obj.id());
		arr.should.have.lengthOf(3);
	});
	it('should stop if val is returned', function () {
		arr = [];
		child._prop('prototype', parent);
		child2._prop('prototype', parent);
		obj._prop('prototype', child);
		obj._chainUp(function (curr) {
			arr.push(curr.id());
			if (curr._equals(child))
				return 'stop';
		});
		arr.should.include(child.id());
		arr.should.include(obj.id());
		arr.should.have.lengthOf(2);
	});
});

describe('._getInherits()', function () {
	it('should return all objects that inherit directly from target object', function () {
		child._prop('prototype', parent);
		child2._prop('prototype', parent);
		obj._prop('prototype', child);
		var res = parent._getInherits();
		for (var i = res.length - 1; i >= 0; i--) {
			res[i] = res[i].id();
		}
		res.should.include(child.id());
		res.should.include(child2.id());
		res.should.have.lengthOf(2);
	});
});

    ////////////////////////
    // DOM element values //
    ///////////////////////

    describe("._val()", function () {
    	it('should return the value of the DOM element', function () {
    		var inpt = SynerJ.create({type: 'input'});
    		inpt.jqEl.val('test');
    		inpt._val().should.equal('test');
    	});
    });

    describe("._val(value)", function () {
    	it('should set the value of the DOM element', function () {
    		var inpt = SynerJ.create({type: 'input'});
    		inpt._val('test');
    		should.equal(inpt.jqEl.val(), 'test');
    	});
    	it('should return the object', function () {
    		var inpt = SynerJ.create({type: 'input'});
    		inpt._val('foo').equals(inpt).should.be.true;
    	});
    });

    describe("._text()", function () {
    	it('should return the innerHTML of the DOM element', function () {
    		var div = SynerJ.create({type:'div'});
    		div.jqEl.html('lorum ipsum');
    		should.equal(div.text(), 'lorum ipsum');
    	});
    	it('should return undefined when the DOM element has children', function () {
    		var div = SynerJ.create({type:'div'});
    		SynerJ.create({parent: div});
    		should.not.exist(div._text());
    	});
    });

    describe("._text(txt)", function () {
    	it('should set the innerHTML of the DOM element', function () {
    		var div = SynerJ.create({type:'div'});
    		div._text('lorum ipsum');
    		should.equal(div.jqEl.html(), 'lorum ipsum');
    	});
    	it('should throw an error when it has children', function () {
    		var div = SynerJ.create({type:'div'});
    		SynerJ.create({parent: div});
    		(function () {
    			div._text('foo');
    		}).should.throw('text: cannot set text when the object has children');
    	});
    });

     ////////////////////
    // Event Handlers //
    ////////////////////

    describe('._bind(event, handler)', function () {
    	it('should bind the handler to the DOM element', function () {
    		var div = SynerJ.create({type: 'div'});
    		div._bind('click', function () { SynerJ(this).foo = 'bar'; });
    		div.jqEl.trigger('click');
    		should.equal(div.foo, 'bar');
    	});
    	it('should only bind 1 handler to 1 event', function () {
    		var div = SynerJ.create({type: 'div'});
    		div._bind('click', function () { SynerJ(this).foo = 'bar'; });
    		div._bind('click', function () { SynerJ(this).bar = 'foo'; });
    		div.jqEl.trigger('click');
    		should.equal(div.bar, 'foo');
    		should.not.exist(div.foo);
    	});
    });

    describe('._unbind(event)', function () {
    	it('should unbind the handler from event', function () {
    		var div = SynerJ.create({type: 'div'});
    		div._bind('click', function () { SynerJ(this).foo = 'bar'; });
    		div._unbind('click');
    		div.jqEl.trigger('click');
    		should.not.exist(div.foo);
    	});
    });

    describe('._trigger(event)', function () {
    	it('should trigger the event with this pointing to the object', function () {
    		var div = SynerJ.create({id: 'fooTest9', type: 'div'});
    		div._bind('click', function () {
    			this.foo = 'bar';
    			this.equals(SynerJ('fooTest9')).should.be.true
    		});
    		div._trigger('click');
    		should.equal(div.foo, 'bar');
    	});
    });

    describe('._getHandlers()', function () {
    	it('should return an object mapping the events to handlers', function () {
    		var fct1 = function () { return 'foo'; };
    		var fct2 = function () { return 'bar'; };
    		obj._bind('click', fct1);
    		obj._bind('foo', fct2);
    		var handlers = obj._getHandlers();
    		should.equal(handlers.click(), 'foo');
    		should.equal(handlers.foo(), 'bar');
    		Object.keys(handlers).should.have.lengthOf(2);
    	});
    });

    describe('._getHandler()', function () {
    	it('should return the eventhandler', function () {
    		var fct1 = function () { return 'foo'; };
    		obj._bind('click', fct1);
    		var fct2 = obj._getHandler('click');
    		should.equal(fct2(), fct1());
    	});
    });

  });
}, false);
});