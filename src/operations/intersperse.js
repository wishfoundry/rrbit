import foldr from './foldr';
import slice from './slice';
import {push} from '../internal';
import {EMPTY, Node as List} from '../Node';
import {curry} from '../functional';
import {length} from '../accessors';

function tail(list) {
	return slice(1, length(list), list);
}

//pop first element and wrap in a list
function head(list) {
	return slice(0,1, list);
}

function prepend(pre) {
	return function fold(value, list) {
		return push(value, push(pre, list));
	}
}

/**
 * Inject a value between all members of the list.
 *
 * ```
 * intersperse(",", ["one", "two", "three"])  ==  ["one", ",", "two", ",", "three"]
 * ```
 * @param separator
 * @param {List} list
 * @return {List}
 * @private
 */
function _intersperse(separator, list) {
	if (!length(list))
		return EMPTY;

	return foldr(prepend(separator), head(list), tail(list))
}

const intersperse = List.intersperse = curry(_intersperse);

List.prototype.intersperse = function(separator) {
	return intersperse(separator, this);
};

export default intersperse;