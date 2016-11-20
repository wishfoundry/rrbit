import {Node as List, EMPTY} from '../Node';
import {M} from '../constants';
import {length} from '../accessors';

List.times = times;

/**
 * populate an array using provided function
 *
 * @param len
 * @param {function(number)} fn
 * @return {Node}
 */
export default function times(fn, len) {
	if (len <= 0)
		return EMPTY;

	// just iterating over push() isn't terribly fast...
	// we attempt to optimize here by pre-allocating

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
		return new List(h, table, lengths);
	}

	function populateLeaf(fn, from, to) {
		var len = (to - from) % (M + 1);
		var table = new Array(len);
		for (var i = 0; len > i; i++) {
			table[i] = fn(from + i);
		}
		return new List(0, table, void 0);
	}
}