import {curry} from '../functional';
import foldr from './foldr';
import {push} from '../internal';
import {EMPTY, Node as List} from '../Node';

function _reverse(list) {
	return foldr((item, newList) =>
		push(item,newList), EMPTY, list);
}

List.prototype.reverse = function() {
	return reverse(this);
};

const reverse = List.reverse = curry(_reverse);

export default reverse;