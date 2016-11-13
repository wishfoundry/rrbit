import {HEIGHT, LENGTHS, TABLE, E, M} from './constants';
import {curry, flip, defaultTo, getLast, setLast, copy} from './functional';

import {lengthsOf, tableLenOf, heightOf, tableOf, isLeaf, length} from './accessors';
import {Node, EMPTY, isListNode} from './Node'

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes






// == public api list operations ======================================================================================

export function push(item, list) {
	var pushed = _push(item, list);
	if (pushed !== null) {
		return pushed;
	}

	return siblise(list, createBlankTree(item, heightOf(list)));
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
export function append(listA, listB) {
	return foldl(push, listA, listB);
}

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
	//invert negative numbers
	function confine(i) {
		return i < 0 ? (i + length(list)) : i;
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
function indexOf(value, list) {
	// const table = tableOf(list);
	// var i = table.length;
	// if (isLeaf(list)) {
	// 	while (i--) {
	// 		accum = fn(table[i], accum);
	// 	}
	// } else {
	// 	while (i--) {
	// 		accum = foldr(fn, accum, table[i]);
	// 	}
	// }
	// return accum;
}

// == private internal list operations ================================================================================

function sliceLeft(from, list) {
	if (from === 0)
		return list;

	const listTable = tableOf(list);
	// Handle leaf level.
	if (isLeaf(list))
		return new Node(0, listTable.slice(from, listTable.length + 1));

	// Slice the left recursively.
	var left = getSlot(from, list);
	var sliced = sliceLeft(from - (left > 0 ? list[LENGTHS][left - 1] : 0), listTable[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === listTable.length - 1) {
		return sliced;
	}

	// Create new node.
	var tbl = listTable.slice(left, listTable.length + 1);
	tbl[0] = sliced;
	var lengths = new Array(listTable.length - left);
	var len = 0;
	for (var i = 0; i < tbl.length; i++) {
		len += length(tbl[i]);
		lengths[i] = len;
	}

	return new Node(heightOf(height), tbl,  lengths);
}

function sliceRight(to, list) {
	if (to === length(list))
		return list;

	const listTable = tableOf(list);
	// Handle leaf level.
	if (isLeaf(list))
		return new Node(0, listTable.slice(0, to));

	// Slice the right recursively.
	var right = getSlot(to, list);
	var sliced = sliceRight(to - (right > 0 ? list[LENGTHS][right - 1] : 0), listTable[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
		return sliced;

	// Create new node.
	var lengths = list[LENGTHS].slice(0, right);
	var tbl = listTable.slice(0, right);
	if (tableOf(sliced).length > 0) {
		tbl[right] = sliced;
		lengths[right] = length(sliced) + (right > 0 ? lengths[right - 1] : 0);
	}
	return new Node(heightOf(list), tbl, lengths);
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, list) {
	var slot = i >> (5 * list[HEIGHT]);
	while (list[LENGTHS][slot] <= i) {
		slot++;
	}
	return slot;
}


function unsafeGet(i, list) {
	for (var x = heightOf(list); x > 0; x--) {
		var slot = i >> (x * 5);
		while (lengthsOf(list)[slot] <= i) {
			slot++;
		}
		if (slot > 0) {
			i -= lengthsOf(list)[slot - 1];
		}
		list = tableOf(list)[slot];
	}
	return tableOf(list)[i];
}

function unsafeSet(i, item, list) {
	list = nodeCopy(list);

	if (isLeaf(list)) {
		tableOf(list)[i] = item;
	} else {
		var slot = getSlot(i, list);
		if (slot > 0) {
			i -= lengthsOf(list)[slot - 1];
		}
		tableOf(list)[slot] = unsafeSet(i, item, tableOf(list)[slot]);
	}
	return list;
}


// Recursively creates a tree with a given height containing
// only the given item.
function createBlankTree(item, height) {
	if (height === 0) {
		return new Node(0, [item]);
	}
	return new Node(height, [createBlankTree(item, height - 1)], [1]);
}

// Navigation functions
function botRight(a) {
	return getLast(tableOf(a));
}

function botLeft(a) {
	return tableOf(a)[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a) {
	return new Node(heightOf(a), copy(tableOf(a)), (isLeaf(a) ? void 0: copy(lengthsOf(a))) );
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, height) {
	return height === heightOf(tree) ? tree : new Node(height, [parentise(tree, height - 1)], [length(tree)]);
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b) {
	return new Node(heightOf(a) + 1, [a, b], [length(a), length(a) + length(b)]);
}

/** Recursively tries to push an item to the bottom-right most
 * tree possible. If there is no space left for the item,
 * null will be returned.
 * @param {*} item
 * @param {Node} list
 * @return {Node|null}
 */
function _push(item, list) {
	// Handle resursion stop at leaf level.
	if (isLeaf(list)) {
		return !(tableOf(list).length < M) ? null : new Node(0, tableOf(list).slice().concat(item));
	}

	// Recursively push
	var pushed = _push(item, botRight(list));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null) {
		var newA = nodeCopy(list);
		setLast(pushed, tableOf(newA));
		setLast(getLast(lengthsOf(newA)) + 1, lengthsOf(newA));
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (tableLenOf(list) < M) {
		var newSlot = createBlankTree(item, heightOf(list) - 1);

		return new Node(heightOf(list),
			copy(tableOf(list)).concat(newSlot),
			copy(lengthsOf(list)).concat(getLast(lengthsOf(list)) + length(newSlot))
		);
	} else {
		return null;
	}
}






