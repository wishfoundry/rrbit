import {isLeaf, tableOf, tableLenOf, heightOf, lengthsOf, length} from './accessors';
import {Node} from './Node';
import {getLast, setLast, copy} from './functional';
import {M, E} from './constants'
/**
 * private util operations rrb lists use
 *
 *
 *
 *
 *
 */

// Recursively creates a tree with a given height containing
// only the given item.
export function createNodeWithHeight(item, height) {
	if (height === 0) {
		return new Node(0, [item], void 0);
	}
	return new Node(height, [createNodeWithHeight(item, height - 1)], [1]);
}


export function sliceLeft(from, list) {
	if (from === 0)
		return list;

	const listTable = tableOf(list);
	// Handle leaf level.
	if (isLeaf(list))
		return new Node(0, listTable.slice(from, listTable.length + 1), void 0);

	// Slice the left recursively.
	var left = getSlot(from, list);
	var sliced = sliceLeft(from - (left > 0 ? lengthsOf(list)[left - 1] : 0), listTable[left]);

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

	return new Node(heightOf(list), tbl,  lengths);
}

export function sliceRight(to, list) {
	if (to === length(list))
		return list;

	const listTable = tableOf(list);
	// Handle leaf level.
	if (isLeaf(list))
		return new Node(0, listTable.slice(0, to), void 0);

	// Slice the right recursively.
	var right = getSlot(to, list);
	var sliced = sliceRight(to - (right > 0 ? lengthsOf(list)[right - 1] : 0), listTable[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
		return sliced;

	// Create new node.
	var lengths = lengthsOf(list).slice(0, right);
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
	var slot = i >> (5 * heightOf(list));
	while (lengthsOf(list)[slot] <= i) {
		slot++;
	}
	return slot;
}


export function unsafeGet(i, list) {
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

export function unsafeSet(i, item, list) {
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
export function siblise(a, b) {
	return new Node(heightOf(a) + 1, [a, b], [length(a), length(a) + length(b)]);
}

/** Recursively tries to push an item to the bottom-right most
 * tree possible. If there is no space left for the item,
 * null will be returned.
 * @param {*} item
 * @param {Node} list
 * @return {Node|null}
 */
export function pushIfSpace(item, list) {
	// Handle resursion stop at leaf level.
	if (isLeaf(list)) {
		if (tableOf(list).length < M) {
			return new Node(0, tableOf(list).slice().concat(item), void 0);
		}

		return null;
	}

	// Recursively push
	var pushed = pushIfSpace(item, botRight(list));

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
		var newSlot = createNodeWithHeight(item, heightOf(list) - 1);

		return new Node(heightOf(list),
			copy(tableOf(list)).concat(newSlot),
			copy(lengthsOf(list)).concat(getLast(lengthsOf(list)) + length(newSlot))
		);
	} else {
		return null;
	}
}






