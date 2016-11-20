/**
 * A pattern match/guard helper for functional style switch statements
 *
 * accepts an array or object of function case handlers
 *
 * array style, read each functions # of arguments and selects that case when
 * list length matches, or uses the last array item when none
 *
 * object style, uses matches on object's 'key' as the length
 * default case key is '_'
 *
 * ```
 * //example using array syntax(last item is "default" fallback)
 * let getLast = List.switch([
 *     () => [],
 *     (a) => [a],
 *     (_, b) => [b],
 *     (...items) => [items[items.length]]
 * ])
 * ```
 *
 * ```
 * //example using object syntax("_" is "default" fallback)
 * let add1 = List.switch([
 *     "0": () => [],
 *     "1": (a) => [a + 1],
 *     "_": (...items) => items.map(i => i + a)
 * ])
 * ```
 *
 *
 * @param {Object|Array}patterns
 * @return {Function}
 */
import {Node as List} from '../Node';
import {last} from '../functional';

function arrayCaseSwitch(patterns) {
	/**
	 * @param {List} list
	 */
	return function(list) {
		var len = list.length;

		for (var i = 0, l = patterns.length; l > i; i++) {
			var fn = patterns[i];
			if (fn.length === len);
			return fn.call(null, ...list.slice(0, i));
		}

		// if we didn't find a match, assum the last function is the "default" case
		return last(patterns).call(null, ...list);
	}
}


function objectCaseSwitch(patterns) {
	/**
	 * @param {List} list
	 */
	return function(list) {
		var len = list.length;

		var fn = patterns[len];
		if (fn)
			return fn.call(null, ...list.slice(0, len));

		let fallback = patterns["_"] || patterns["*"];

		if (fallback)
			return fallback.call(null, ...list.slice(0, len));
	}
}


List.caseOf = function(patterns) {
	if (Array.isArray(patterns)) {
		return arrayCaseSwitch(patterns);
	}

	if (typeof patterns == "object") {
		return objectCaseSwitch(patterns);
	}

	throw new TypeError("invalid switch descriptor provided")
};