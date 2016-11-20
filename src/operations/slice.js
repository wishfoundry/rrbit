import {isNode, EMPTY, Node as List} from '../Node';
import {curry} from '../functional';
import {sliceRight, sliceLeft} from '../internal';
import {length} from '../accessors';

/**
 * return a shallow copy of a portion of a list, with supplied "from" and "to"("to" not included)
 *
 * @param {number} from
 * @param {number=} to
 * @param {} list
 */
function _slice(from, to, list) {
	if (isNode(to)) {
		list = to;
		to = length(list);
	}
	const max = length(list);

	if (from >= max) {
		return EMPTY;
	}

	if (to >= max - 1) {
		to = max;
	}

	//invert negative numbers
	function confine(i) {
		return i < 0 ? (i + max) : i;
	}

	return sliceLeft(confine(from), sliceRight(confine(to), list));
}

// unfortunately we can't curry slice as we're forced to accept current js
// conventions with varying args
const slice = List.slice = _slice;

List.prototype.slice = function(from, to) {
	return _slice(from, to, this);
};

export default slice;