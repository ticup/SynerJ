// shared/serialize.js

// Author: Tim Coppieters
// Date: 09/2012

define([], function () {

	////////////////////
	// serialization //
	//////////////////

	// serializeArguments
	function serializeArguments(args, Dobject) {
		var res = [];
		for (var i = 0; i < args.length; i++) {
			var el = args[i];
			if (Dobject.instanceOf(el)) {
				res[i] = serializeDobject(el);
			} else {
				res[i] = el;
			}
		}
		return res;
	}

	// serializeDobject
	function serializeDobject(obj) {
		return ['serializedDobject', obj.id()];
	}

	//////////////////////
	// deserialization //
	////////////////////

	function deserializeArguments(args, SynerJ) {
		var res = [];
		for (var i = 0; i < args.length; i++) {
			var el = args[i];
			if (isDobject(el)) {
				res[i] = deserializejQuery(el, SynerJ);
			} else {
				res[i] = el;
			}
		}
		return res;
	}

	// isDobject
	function isDobject(str) {
		return (arg instanceof Array) && (arg.length === 2) && (arg[0] === 'serializedDobject');
	}

	// deserializeDobject
	function deserializeDobject(arr, SynerJ) {
		return SynerJ(arr[1]);
	}

	return {
		deserialize:  deserializeArguments,
		serialize:    serializeArguments
	};
});