import {Node, EMPTY} from '../Node';
import {slice} from '../functional';
import {M} from '../constants';
import {length} from '../accessors'

/**
 * create an rrb vector from a js array
 * note: this is meant for internal use only. public usage should be with List.from()
 *
 * @param {Array} jsArray
 */
export default function fromArray(jsArray) {
	var len = jsArray.length;
	if (len === 0)
		return EMPTY;

	return _fromArray(jsArray, Math.floor(Math.log(len) / Math.log(M)), 0, len);

	function _fromArray(jsArray, h, from, to) {
		if (h === 0) {
			return new Node(0, slice(from, to, jsArray), void 0);
		}

		var step = Math.pow(M, h);
		var len = Math.ceil((to - from) / step);
		var table = new Array(len);
		var lengths = new Array(len);
		for (var i = 0; len > i; i++) {
			//todo: trampoline?
			table[i] = _fromArray(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		return new Node(h, table, lengths);
	}

}