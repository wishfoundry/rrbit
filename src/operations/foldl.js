import {curry} from '../functional';
import {tableOf, isLeaf} from '../accessors';
import {Node as List} from '../Node';


/**
 * fold left(reverse)
 *
 * @param {function(T, Z)} fn
 * @param {Z} accum
 * @param {Node<T>} list
 * @return {*}
 */
function _foldl(fn, accum, list) {
	const table = tableOf(list);
	var len = table.length;
	if (isLeaf(list)) {
		for (var i = 0; len > i; i++) {
			accum = fn(table[i], accum);
		}
	} else {
		for (var i = 0; len > i; i++) {
			accum = foldl(fn, accum, table[i]);
		}
	}
	return accum;
}

List.prototype.foldl = function(fn, seed) {
	return _foldl(fn, seed, this);
};

const foldl = List.foldl = curry(_foldl);

export default foldl;