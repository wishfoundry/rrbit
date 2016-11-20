import {append} from '../append';
import {sliceRight, sliceLeft} from '../internal';
import {curry} from '../functional';
import {Node as List} from '../Node';
import indexOf from './indexOf';



function _removeAt(i, list) {
	return append(sliceLeft(i - 1, list), sliceRight(i, list))
}

function _removeItem(item, list) {
	var i = indexOf(item);
	return i === -1 ? list : remove(i, list);
}

const removeAt = List.removeAt = curry(_removeAt);
const removeItem = List.removeItem = curry(_removeItem);


export {
	removeItem,
	removeAt as default
};

