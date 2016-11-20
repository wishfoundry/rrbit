import {curry} from '../functional';
import {tableOf, isLeaf} from '../accessors';
import {Node as List} from '../Node';


/**
 * fold right
 * a.k.a functional style "reduce"
 *
 * note: standard js reducing fns expect accum first, but this is iteratee first
 *
 * @param {function(T, Z)}fn
 * @param {Z} accum
 * @param {Node<T>} list
 * @return {*}
 */
function _foldr(fn, accum, list) {
	const table = tableOf(list);
	var i = table.length;
	if (isLeaf(list)) {
		while (i--) {
			accum = fn(table[i], accum);
		}
	} else {
		while (i--) {
			accum = foldr(fn, accum, table[i]);
		}
	}
	return accum;
}

List.prototype.foldr = List.foldr = function(fn, seed) {
	return _foldr(fn, seed, this);
};

const foldr = List.foldr = curry(_foldr);

export default foldr;