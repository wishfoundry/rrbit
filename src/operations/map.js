import {curry} from '../functional';
import {tableOf, isLeaf, lengthsOf, heightOf} from '../accessors';
import {Node as List} from '../Node';

function _map(fn, list, from = 0) {
	const table = tableOf(list);
	const len = table.length;
	var tbl = new Array(len);

	// we're micro optimizing for the common use case here, foldr could replace this just fine
	// but since we're not changing the length, we can skip over some table reshuffling
	if (isLeaf(list)) {
		for (var i = 0; len > i; i++) {
			tbl[i] = fn(table[i], from + i);
		}
	} else {
		for (var i = 0; len > i; i++) {
			tbl[i] = map(fn, table[i],
				(i == 0 ? from : from + lengthsOf(list)[i - 1]))
		}
	}


	return new List(heightOf(list), tbl, lengthsOf(list));
}

List.prototype.map = function(fn) {
	return _map(fn, this);
};

const map = List.map = curry(_map);

export default map;