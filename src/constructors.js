import {Node,EMPTY} from './Node';
import {slice, curry} from './functional';
import {isArray} from './is';
import {M} from './constants';
import {length} from './accessors'

function _leaf(items) {
	return new Node(0, items, void 0);
}

/**
 * create an rrb vector from a js array
 *
 * @param {Array} jsArray
 */
function fromArray(jsArray) {
	var len = jsArray.length;
	if (len === 0)
		return EMPTY;

	return _fromArray(jsArray, Math.floor(Math.log(len) / Math.log(M)), 0, len);

	function _fromArray(jsArray, h, from, to) {
		if (h === 0) {
			return new Node(0, slice(from, to, jsArray), void 0);
		}

		var step = Math.pow(M, h);
		var len = Math.ceil((to - from) / step);
		var table = new Array(len);
		var lengths = new Array(len);
		for (var i = 0; len > i; i++) {
			//todo: trampoline?
			table[i] = _fromArray(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		return new Node(h, table, lengths);
	}

}

// all empty nodes are equal
export function empty() {
	return EMPTY;
}

// perf shortcut for an array of one
export function one(item) {
	return _leaf([ item ]);
}

/**
 * the default list constructor
 * accepts an single native array, varargs, or nothing(if an empty list is desired)
 *
 */
export function of() {
	var len = arguments.length;

	if (len == 0)
		return EMPTY;

	var first = arguments[0];

	// we assume if only one arg && is an array, to iterate over it
	// THIS MAY BE WRONG(e.g. cannot create a list with 1 array element)
	if (len == 1)
		return isArray(first) ? fromArray(first) : one(first);

	return fromArray(arguments);
}


/**
 * populate an array using provided function
 *
 * @param len
 * @param {function(number)} fn
 * @return {Node}
 */
export function times(fn, len) {
	if (len <= 0)
		return empty();

	var height = Math.floor( Math.log(len) / Math.log(M) );
	return populate(fn, height, 0, len);

	function populate(func, h, from, to) {

		if (h === 0) { //leaf node
			return populateLeaf(func, from, to);
		}

		// populate container node
		var step = Math.pow(M, h);
		var len = Math.ceil((to - from) / step);
		var table = new Array(len);
		var lengths = new Array(len);
		for (var i = 0; len > i; i++) {
			// todo: trampoline?
			table[i] = populate(func, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
		}
		return new Node(h, table, lengths);
	}

	function populateLeaf(fn, from, to) {
		var len = (to - from) % (M + 1);
		var table = new Array(len);
		for (var i = 0; len > i; i++) {
			table[i] = fn(from + i);
		}
		return _leaf(table);
	}
}