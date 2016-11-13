const _slice = Array.prototype.slice;
export function slice(from, to, array) {
	return _slice.call(array, from, to);
}

export function compose() {
	var funcs = _slice.call(arguments);

	if (funcs.length == 0)
		return identity;

	return function () {
		var val = apply(funcs[funcs.length - 1], arguments);
		for (var i = funcs.length - 2; i > -1; i--) {
			val = funcs[i].call(undefined, val)
		}
		return val
	}
}

export function curry(fn) {

	return function() {
		return _currify(fn, _slice.call(arguments), fn.length - arguments.length)
	}
}

function _currify(fn, args, remain) {
	if (remain < 1)
		return apply(fn, args);

	return function() {
		args = args.slice(0, fn.length-1).concat(_slice.call(arguments, 0));
		return _currify(fn, args, remain - arguments.length);
	}
}

export function apply(fn, args) {
	var len = args.length;

	if (len === 0) return fn();
	if (len === 1) return fn(args[0]);
	if (len === 2) return fn(args[0], args[1]);
	if (len === 3) return fn(args[0], args[1], args[2]);
	if (len === 4) return fn(args[0], args[1], args[2], args[3]);
	if (len === 5) return fn(args[0], args[1], args[2], args[3], args[4]);
	if (len === 6) return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
	if (len === 7) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	if (len === 8) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
	if (len === 9) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
	if (len === 10)return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);

	return fn.apply(undefined, args);
}

export function flip(fn){
	return (a, b) => fn(b, a);
}


export function always() { return true; }

export function identity(value) { return value; }

export const attr = curry(function attr(key, obj) {
	return obj[key];
});

// clone an array
export function copy(array) {
	return _slice.call(array, 0);
}

export function defaultTo(dflt) {
	return function(value) {
		return typeof value == "undefined" || value === null || isNaN(value) ? dflt : value;
	}
}

export function getLast(jsArray) {
	return jsArray[jsArray.length - 1];
}

export function setLast(value, jsArray) {
	jsArray[jsArray.length - 1] = value;
	return jsArray;
}