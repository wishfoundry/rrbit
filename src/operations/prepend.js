import {curry} from '../functional';
import {Node as List} from '../Node';
import {append} from '../append';


function _prepend(listA, listB) {
	return append(listB, listA);
}

List.prototype.prepend = function (list) {
	return append(list, this);
};

const prepend = List.prepend = curry(_prepend);

export default prepend;