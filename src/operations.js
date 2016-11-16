
import {curry} from './functional';

import {lengthsOf, heightOf, tableOf, isLeaf, length} from './accessors';
import {Node, EMPTY, isListNode} from './Node';
import {
	sliceLeft,
	sliceRight,
	unsafeGet,
	unsafeSet,
	siblise,
	pushIfSpace,
	createNodeWithHeight } from './internal';

import {append} from './append'

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes






// == public api list operations ======================================================================================

export function push(item, list) {

	return pushIfSpace(item, list) || siblise(list, createNodeWithHeight(item, heightOf(list)));
}

export function reverse(list) {
	return foldr((item, newList) =>
		push(item,newList), EMPTY, list);
}


/**
 * concat listB onto listA
 *
 * The paper describes an optimized version, but we'll cheat with this for now
 *
 * @param listA
 * @param listB
 * @return {*}
 */
// export function append(listA, listB) {
// 	return foldl(push, listA, listB);
// }

export {append}

export function prepend(listA, listB) {
	return append(listB, listA);
}


export function get(i, list) {
	if (i < 0 || i >= length(list)) {
		throw new Error('Index ' + i + ' is out of range');
	}
	return unsafeGet(i, list);
}


export function set(i, item, list) {
	// if given index is negative, or greater than the length of list
	// be nice and don't throw an error
	// adding to the end of a list should always use push
	if (i < 0 || length(list) <= i) {
		return list;
	}
	return unsafeSet(i, item, list);
}

export function insertAt(i, item, list) {
	// since slice is fast in rrb, try to use it instead of just filter
	return append(push(sliceLeft(i, list), item), sliceRight(i, list))

}

export function removeAt(i, list) {
	return append(sliceLeft(i -1, list), sliceRight(i, list))
}

export function removeItem(item, list) {
	var i = indexOf(item);
	return i === -1 ? list : remove(i, list);
}


export const map = curry(function map(fn, list, from = 0) {
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


	return new Node(heightOf(list), tbl, lengthsOf(list));
});

// todo: add a forEach method?
// not really sure we need to add support for side effects since we have iterator support


/**
 * fold left(reverse)
 *
 * @param {function(T, Z)} fn
 * @param {Z} accum
 * @param {Node<T>} list
 * @return {*}
 */
export const foldl = curry(function foldl(fn, accum, list) {
	const table = tableOf(list);
	var len = table.length;
	if (isLeaf(list)) {
		for (var i = 0; len > i; i++) {
			accum = fn(table[i], accum);
		}
	} else {
		for (var i = 0; len > i; i++) {
			accum = foldl(fn, accum, table[i]);
		}
	}
	return accum;
});



/**
 * fold right
 * a.k.a functional style "reduce"
 *
 * note: standard js reducing fns expect accum first, but this is iteratee first
 *
 * @param {function(T, Z)}fn
 * @param {Z} accum
 * @param {Node<T>} list
 * @return {*}
 */
export const foldr = curry(function foldr(fn, accum, list) {
	const table = tableOf(list);
	var i = table.length;
	if (isLeaf(list)) {
		while (i--) {
			accum = fn(table[i], accum);
		}
	} else {
		while (i--) {
			accum = foldr(fn, accum, table[i]);
		}
	}
	return accum;
});




/**
 * return a new list of items that pass test fn
 *
 * @param {function(T)} fn
 * @param {Node<T>} list
 * @return {Node<T>}
 */
export const filter = curry(function filter(fn, list) {
	return foldr((item, acc) =>
		(fn(item) ? push(item, acc) : acc), EMPTY, list);
});



/**
 * return a shallow copy of a portion of a list, with supplied "from" and "to"("to" not included)
 *
 * @param from
 * @param to
 * @param list
 */
export function slice(from, to, list) {

	var max = length(list);
	if (from >= max){
		return empty;
	}
	if (to >= max - 1){
		to = max;
	}
	//invert negative numbers
	function confine(i) {
		return i < 0 ? (i + max) : i;
	}

	if (isListNode(to)) {
		list = to;
		to = length(list);
	}

	return sliceLeft(confine(from), sliceRight(confine(to), list));
}

function find(predicate, list) {
	for (var item of list) {
		if (predicate(item))
			return item;
	}
}

export function indexOf(value, list) {
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

export function isMember(item, list) {
	return indexOf(item, list) !== -1;
}

export function intersperse(separator, list) {

}





