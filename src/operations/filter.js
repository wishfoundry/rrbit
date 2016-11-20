import foldr from './foldr';
import {EMPTY, Node as List} from '../Node';
import {curry} from '../functional';
import {push} from '../internal';

/**
 * return a new list of items that pass test fn
 *
 * @param {function(T)} fn
 * @param {Node<T>} list
 * @return {Node<T>}
 */
function _filter(fn, list) {
	return foldr((item, acc) =>
		(fn(item) ? push(item, acc) : acc), EMPTY, list);
}

List.prototype.filter = function(fn) {
	return _filter(fn, this);
};

const filter = List.filter = curry(_filter);

export default filter;