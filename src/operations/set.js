import {curry} from '../functional';
import {length} from '../accessors';
import {unsafeSet} from '../internal';
import {Node as List} from '../Node';

export function _set(i, item, list) {
	// if given index is negative, or greater than the length of list
	// be nice and don't throw an error
	// adding to the end of a list should always use push
	if (i < 0 || length(list) <= i) {
		return list;
	}
	return unsafeSet(i, item, list);
}

List.prototype.set = function(i, item) {
	return _set(i, item, this);
};

const set = List.set = curry(_set);

export default set;
