import {append} from '../append';
import {curry} from '../functional';
import {sliceLeft, sliceRight} from '../internal'
import {push} from '../internal';
import {Node as List} from '../Node';

/**
 *
 * @param i
 * @param item
 * @param list
 * @return {Node}
 * @private
 */
function _insertAt(i, item, list) {

	// since slice is fast in rrb, try to use it instead of just filter
	return append(push(sliceLeft(i, list), item), sliceRight(i, list))
}


const insertAt = List.insertAt = curry(_insertAt);

List.prototype.insertAt = function(i, item) {
	return _insertAt(i, item, this);
};

export default insertAt;