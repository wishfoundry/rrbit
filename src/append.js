import {E, M} from './constants';
import {tableOf, tableLenOf, heightOf, length, lengthsOf, isLeaf} from './accessors';
import {parentise, siblise, nodeCopy, firstSlot, lastSlot} from './internal';
import {Node} from './Node';

/**
 * append/concat to lists together
 *
 * this is an attempt to optimize only one use case
 * not compatible with current code base
 *
 *
 * still need to verify this is worth the perf benefits
 *
 *
 *
 *
 *
 */


/**
 * join to lists together(concat)
 *
 * @param {Node} a
 * @param {Node} b
 * @return {Node}
 */
export function append(a, b) {
	var aTable = a['@@rrb/table'];
	var bTable = b['@@rrb/table'];
	var aTableLen = aTable.length;
	var bTableLen = bTable.length;

	if (aTableLen === 0) return b;
	if (bTableLen === 0) return a;

	var [a2, b2] = __append(a, b);
	var a2Table = a2['@@rrb/table'];
	var b2Table = b2['@@rrb/table'];
	var a2TableLen = a2Table.length;
	var b2TableLen = b2Table.length;

	// Check if both nodes can be crunshed together.
	if (a2TableLen + b2TableLen <= M) {
		if (a2Table.length === 0) return b2;
		if (b2Table.length === 0) return a2;

		// Adjust .table and .lengths
		a2['@@rrb/table'] = a2Table.concat(b2Table);
		if (a2['@@rrb/height'] > 0) {
			var len = length(a2);
			var lengths = lengthsOf(b2);
			for (var i = 0, l = lengths.length; i < l; i++) {
				lengths[i] += len;
			}
			a2['@@rrb/lengths'] = a2['@@rrb/lengths'].concat(lengths);
		}

		return a2;
	}

	if (a2['@@rrb/height'] > 0) {
		var toRemove = calcToRemove(a, b);
		if (toRemove > E) {
			[a2, b2] = shuffle(a2, b2, toRemove);
		}
	}

	return siblise(a2, b2);
}

/**
 * Returns an array of two nodes; right and left. One node _may_ be empty.
 * @param {Node} a
 * @param {Node} b
 * @return {Array<Node>}
 * @private
 */
function __append(a, b) {
	var aHeight = a['@@rrb/height'];
	var bHeight = b['@@rrb/height'];

	if (aHeight == 0 && bHeight == 0) {
		return [a, b];
	}

	if (aHeight !== 1 || bHeight !== 1) {
		if (aHeight === bHeight) {
			a = nodeCopy(a);
			b = nodeCopy(b);
			var tuple  = __append(lastSlot(a), firstSlot(b));
			var a0 = tuple[0];
			var b0 = tuple[1];

				insertRight(a, b0);
			insertLeft(b, a0);

		} else if (aHeight > bHeight) {
			a = nodeCopy(a);
			var tuple = __append(lastSlot(a), b);
			var a0 = tuple[0];
			var b0 = tuple[1];

			insertRight(a, a0);
			b = parentise(b0, b0['@@rrb/height'] + 1);
		} else {
			b = nodeCopy(b);
			var tuple = __append(a, firstSlot(b));

			var left = tableLenOf(tuple[0]) === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, tuple[left]);
			a = parentise(tuple[right], tuple[right]['@@rrb/height'] + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (tableLenOf(a) === 0 || tableLenOf(b) === 0) {
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E) {
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for __append. Replaces a child node at the side of the parent.
function insertRight(parent, node) {
	var index = tableLenOf(parent) - 1;
	tableOf(parent)[index] = node;
	lengthsOf(parent)[index] = length(node) + (index > 0 ? lengthsOf(parent)[index - 1] : 0);
}

function insertLeft(parent, node) {
	var lengths = lengthsOf(parent);
	var table = tableOf(parent);

	if (tableLenOf(node) > 0) {
		table[0] = node;
		lengths[0] = length(node);

		var len = length(table[0]);
		for (var i = 1, l = lengths.length; l > i; i++) {
			lengths[i] = len = (len += length(table[i]));
		}

	} else {
		table.shift();
		for (var i = 1, l = lengths.length; l > i; i++) {
			lengths[i] = lengths[i] - lengths[0];
		}
		lengths.shift();
	}
}


/**
 * Returns an array of two balanced nodes.
 * @param {Node} a
 * @param {Node} b
 * @param {number} toRemove
 * @return {Array<Node>}
 */
function shuffle(a, b, toRemove) {
	var newA = allocate(heightOf(a), Math.min(M, tableLenOf(a) + tableLenOf(b) - toRemove));
	var newB = allocate(heightOf(a), tableLenOf(newA) - (tableLenOf(a) + tableLenOf(b) - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (tableOf(getEither(tableOf(a), tableOf(a), read)).length % M === 0) {
		setEither(tableOf(newA), tableOf(newB), read, getEither(tableOf(a), tableOf(b), read));
		setEither(lengthsOf(newA), lengthsOf(newB), read, getEither(lengthsOf(a), lengthsOf(b), read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = allocate(heightOf(a) - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (tableLenOf(slot) > 0 ? 1 : 0) < toRemove) {
		// Find out the max possible items for copying.
		var source = getEither(tableOf(a), tableOf(b), read);
		var to = Math.min(M - tableLenOf(slot), tableLenOf(source));

		// Copy and adjust size table.
		slot['@@rrb/table'] = tableOf(slot).concat(tableOf(source).slice(from, to));
		if (slot['@@rrb/height'] > 0) {
			var lengths = lengthsOf(slot);
			var len = lengths.length;
			for (var i = len; i < len + to - from; i++) {
				lengths[i] = length(tableOf(slot)[i]);
				lengths[i] += (i > 0 ? lengthsOf(slot)[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (tableLenOf(source) <= to) {
			read++;
			from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (tableLenOf(slot) === M) {
			saveSlot(newA, newB, write, slot);
			slot = allocate(heightOf(a) - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (tableLenOf(slot) > 0) {
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < tableLenOf(a) + tableLenOf(b)) {
		saveSlot(newA, newB, write, getEither(tableOf(a), tableOf(b), read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Creates a node or leaf with a given length at their arrays for performance.
// Is only used by shuffle.
function allocate(height, length) {
	if (height > 0)
		return new Node(length, new Array(length), new Array(length));

	return new Node(0, new Array(length), void 0);
}

/**
 * helper for setting picking a slot between to nodes
 * @param {Node} aList - a non-leaf node
 * @param {Node} bList - a non-leaf node
 * @param {number} index
 * @param {Node} slot
 */
function saveSlot(aList, bList, index, slot) {
	setEither(tableOf(aList), tableOf(bList), index, slot);

	var isInFirst = (index === 0 || index === lengthsOf(aList).length);
	var len = isInFirst ? 0 : getEither(lengthsOf(aList), lengthsOf(aList), index - 1);

	setEither(lengthsOf(aList), lengthsOf(bList), index, len + length(slot));
}

// getEither, setEither and saveSlot are helpers for accessing elements over two arrays.
function getEither(a, b, i) {
	return i < a.length ? a[i] : b[i - a.length];
}

function setEither(a, b, i, value) {
	if (i < a.length) {
		a[i] = value;
	} else {
		b[i - a.length] = value;
	}
}

/**
 * Returns the extra search steps for E. Refer to the paper.
 *
 * @param {Node} a - a non leaf node
 * @param {Node} b - a non leaf node
 * @return {number}
 */
function calcToRemove(a, b) {
	var aTable = a['@@rrb/table'];
	var bTable = b['@@rrb/table'];
	var subLengths = sumOfLengths(aTable) + sumOfLengths(bTable);

	return (aTable.length + bTable.length) - (Math.floor((subLengths - 1) / M) + 1);
}

function sumOfLengths(table) {
	var sum = 0;
	var len = table.length;
	for (var i = 0; len > i; i++)
		sum += table[i]['@@rrb/table'].length;

	return sum;
}