import {tableOf, isLeaf} from '../accessors';
import {curry} from '../functional';
import {Node as List} from '../Node';

/**
 *
 * @param value
 * @param list
 * @return {*}
 */
function _indexOf(value, list) {
	const table = tableOf(list);
	var i = table.length;
	if (isLeaf(list)) {
		while (i--) {
			if (table[i] === value)
				return i;
		}
	} else {
		while (i--) {
			var subI = indexOf(value, table[i]);
			if (subI !== -1)
				return i + subI;
		}
	}
	return -1;
}

function _isMember(item, list) {
	return indexOf(item, list) !== -1;
}


List.prototype.indexOf = function(value) {
	return indexOf(value, this);
};

List.prototype.isMember = function(item, list) {
	return indexOf(item, list) !== -1;
};


const indexOf = List.indexOf = curry(_indexOf);
const isMember = List.isMember = curry(_isMember);

export {
	isMember,
	indexOf as default
};

