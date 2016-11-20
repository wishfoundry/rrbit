import {curry} from '../functional';
import {length} from '../accessors';
import {Node as List} from '../Node';
import {unsafeGet,} from '../internal';


function _get(i, list) {
	if (i < 0 || i >= length(list)) {
		throw new Error('Index ' + i + ' is out of range');
	}
	return unsafeGet(i, list);
}

List.prototype.get = function(i) {
	return _get(i, this);
};

const get = List.get = curry(_get);

export default get;