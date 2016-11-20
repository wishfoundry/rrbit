import {Node as List} from '../Node';
import {curry} from '../functional';

/**
 *
 * @param {function}predicate
 * @param {List} list
 * @return {*}
 * @private
 */
function _find(predicate, list) {
	for (var item of list) {
		if (predicate(item))
			return item;
	}
}

const find = List.find = curry(_find);

List.prototype.find = function(predicate) {
	return _find(predicate, this);
};

export default find;