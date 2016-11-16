'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fl = _interopDefault(require('fantasy-land'));

const _slice = Array.prototype.slice;
function slice$1(from, to, array) {
	return _slice.call(array, from, to);
}



function curry(fn) {

	return function currydFn() {
		return _currify(fn, _slice.call(arguments), fn.length - arguments.length)
	}
}

function _currify(fn, args, remain) {
	if (remain < 1)
		return apply(fn, args);

	return function() {
		args = args.slice(0, fn.length-1).concat(_slice.call(arguments, 0));
		return _currify(fn, args, remain - arguments.length);
	}
}

function apply(fn, args) {
	var len = args.length;

	if (len === 0) return fn();
	if (len === 1) return fn(args[0]);
	if (len === 2) return fn(args[0], args[1]);
	if (len === 3) return fn(args[0], args[1], args[2]);
	if (len === 4) return fn(args[0], args[1], args[2], args[3]);
	if (len === 5) return fn(args[0], args[1], args[2], args[3], args[4]);
	if (len === 6) return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
	if (len === 7) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
	if (len === 8) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
	if (len === 9) return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
	if (len === 10)return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);

	return fn.apply(undefined, args);
}






function identity(value) { return value; }



// clone an array
function copy(array) {
	return _slice.call(array, 0);
}



function last(list) {
	return list[list.length - 1];
}

function first(list) {
	return list[0];
}

function setLast(value, jsArray) {
	jsArray[jsArray.length - 1] = value;
	return jsArray;
}

/*
 * private property accessors
 *
 *
 *
 *
 *
 *
 *
 */


/**
 * get the array containing the lengths of each child node
 * @param {Node} list
 * @return {Array<number>}
*/
function lengthsOf(list) {
	return list['@@rrb/lengths'];
}

function heightOf(list) {
	return list['@@rrb/height'];
}

function tableOf(list) {
	return list['@@rrb/table'];
}

function tableLenOf(list) {
	return list['@@rrb/table'].length;
}


// determine if this is a leaf vs container node
function isLeaf(node) {
	return node['@@rrb/height'] === 0;
}

// get the # of elements in a rrb list
function length(list) {
	return isLeaf(list) ? list['@@rrb/table'].length : last(list['@@rrb/lengths']);
}

/**
 * an RRB tree has two data types:
 *
 * Leaf
 * - height is always 0
 * - table is an collection of values
 *
 * Parent
 * - height is always greater than 0
 * - table is collection of child nodes
 * - lengths is cache of accumulated lengths of children
 *
 * height and table are mandatory, lengths may be null
 *
 */

/**
 *
 * @param {Array} table
 * @return {Node}
 * @constructor
 */


/**
 *
 * @param {Number} height
 * @param {Array<Node>} table
 * @param {Array<number>} lengths
 * @return {Node}
 * @constructor
 */


/**
 * The base list class
 * @param {number} height
 * @param {Array<Node|*>} table
 * @param {Array<number>} lengths
 * @constructor
 */
function Node(height, table, lengths) {
	this['@@rrb/lengths'] = lengths;
	this['@@rrb/height'] = height;
	this['@@rrb/table'] = table;
}

Node.prototype.isEmpty  = () => false; // small optimization because all empty lists are the same element

Object.defineProperty(Node.prototype, 'length', {
	get() {
		return this.size();
	},
	set(value) {
		//do nothing
	}
});

const EMPTY = Object.assign(new Node(0, []), {
	isEmpty() { return true; },
	size() { return 0; }
});

function isListNode(item) {
	return item instanceof Node;
}

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
const M = 32;
const E = 2;

function _leaf(items) {
	return new Node(0, items, void 0);
}

/**
 * create an rrb vector from a js array
 *
 * @param {Array} jsArray
 */
function fromArray(jsArray) {
	var len = jsArray.length;
	if (len === 0)
		return EMPTY;

	return _fromArray(jsArray, Math.floor(Math.log(len) / Math.log(M)), 0, len);

	function _fromArray(jsArray, h, from, to) {
		if (h === 0) {
			return new Node(0, slice$1(from, to, jsArray), void 0);
		}

		var step = Math.pow(M, h);
		var len = Math.ceil((to - from) / step);
		var table = new Array(len);
		var lengths = new Array(len);
		for (var i = 0; len > i; i++) {
			//todo: trampoline?
			table[i] = _fromArray(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
		}
		return new Node(h, table, lengths);
	}

}

// all empty nodes are equal
function empty() {
	return EMPTY;
}

// perf shortcut for an array of one
function one(item) {
	return _leaf([ item ]);
}

/**
 * the default list constructor
 * accepts an single native array, varargs, or nothing(if an empty list is desired)
 *
 */
function from(iterable, mapFn = identity) {
	var list = EMPTY;

	for (var item of iterable) {
		list = list.push(mapFn(item));
	}

	return list;
}

function of(first$$1, ...rest) {

	if (typeof first$$1 === 'undefined')
		return EMPTY;

	if (rest && rest.length > 0)
		return fromArray([first$$1].concat(rest));

	return one(first$$1);
}


/**
 * populate an array using provided function
 *
 * @param len
 * @param {function(number)} fn
 * @return {Node}
 */
function times(fn, len) {
	if (len <= 0)
		return empty();

	var height = Math.floor( Math.log(len) / Math.log(M) );
	return populate(fn, height, 0, len);

	function populate(func, h, from, to) {

		if (h === 0) { //leaf node
			return populateLeaf(func, from, to);
		}

		// populate container node
		var step = Math.pow(M, h);
		var len = Math.ceil((to - from) / step);
		var table = new Array(len);
		var lengths = new Array(len);
		for (var i = 0; len > i; i++) {
			// todo: trampoline?
			table[i] = populate(func, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
			lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
		}
		return new Node(h, table, lengths);
	}

	function populateLeaf(fn, from, to) {
		var len = (to - from) % (M + 1);
		var table = new Array(len);
		for (var i = 0; len > i; i++) {
			table[i] = fn(from + i);
		}
		return _leaf(table);
	}
}

//iterator value signatures
function done()     { return { done: true,  value: null} }
function value(val) { return { done: false, value: val }; }

/**
 * create a js iterator for a list
 *
 * @param {Node} list
 * @return {Iterator}
 */
function iterator(list) {
	return isLeaf(list) ? _leafIterator(list) : _nodeIterator(list);

	function _leafIterator(leaf) {
		var table = tableOf(leaf);
		var len = table.length;
		var i = 0;

		return {
			next() {
				return len > i ? value(table[i++]) : done();
			}
		}
	}

	function _nodeIterator(node) {
		var table = tableOf(node);
		var len = table.length;
		var i = 0;
		var current = iterator(table[0]);

		return {
			next() {
				var response = current.next();
				if (!response.done)
					return response;

				// current iterator is done, get the next iterator and result
				return (++i >= len ? done() : (current = iterator(table[i])).next());
			}
		}
	}


}


// generator version of above
// export function* iteratorGen () {
// 	if (isLeaf(this)) {
// 		for (var value of tableOf(this)) {
// 			yield value;
// 		}
// 	} else {
// 		for (var subTable of tableOf(this)) {
// 			yield * subTable;
// 		}
// 	}
// }



/**
 * iterator that starts from tail and works backwards
 * @param list
 */
function tailIterator(list) {
	throw new Error("feature not yet implemented");

	return isLeaf(list) ? _leafIterator(list) : _nodeIterator(list);


	function _leafIterator(leaf) {
		var table = tableOf(leaf);
		var i = table.length;

		return {
			next() {
				return --i >= 0 ? value(table[i]) : done();
			}
		}
	}

	function _nodeIterator(node) {
		var table = tableOf(node);
		var len = table.length;
		var current = tailIterator(table[--len]); //table cannot have 0 length because it's a container, so we're "safe" TM

		return {
			next() {
				var response = current.next();
				if (!response.done)
					return response;

				// current iterator is done, get the next iterator and result
				return (--len >= 0 ?  (current = iterator(table[len])).next() : done() );
			}
		}
	}


}


// export function* tailIteratorGen() {
// 	var table = tableOf(this);
// 	var i = table.length;
// 	if (isLeaf(this)) {
// 		while(i--) {
// 			yield table[i];
// 		}
// 	} else {
// 		while(i--) {
// 			yield * table[i];
// 		}
// 	}
// };

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
function createNodeWithHeight(item, height) {
	if (height === 0) {
		return new Node(0, [item], void 0);
	}
	return new Node(height, [createNodeWithHeight(item, height - 1)], [1]);
}


function sliceLeft(from, list) {
	if (from === 0)
		return list;

	const listTable = tableOf(list);
	// Handle leaf level.
	if (isLeaf(list))
		return new Node(0, listTable.slice(from, listTable.length + 1), void 0);

	// Slice the left recursively.
	var left = findSlot(from, list);
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

function sliceRight(to, list) {
	if (to === length(list))
		return list;

	const listTable = tableOf(list);
	// Handle leaf level.
	if (isLeaf(list))
		return new Node(0, listTable.slice(0, to), void 0);

	// Slice the right recursively.
	var right = findSlot(to, list);
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
function findSlot(i, list) {
	var slot = i >> (5 * heightOf(list));
	while (lengthsOf(list)[slot] <= i) {
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
		var slot = findSlot(i, list);
		if (slot > 0) {
			i -= lengthsOf(list)[slot - 1];
		}
		tableOf(list)[slot] = unsafeSet(i, item, tableOf(list)[slot]);
	}
	return list;
}





// Navigation functions
function lastSlot(node) {
	return last(tableOf(node));
}

function firstSlot(node) {
	return first(tableOf(node));
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
	return new Node(a['@@rrb/height'] + 1, [a, b], [length(a), length(a) + length(b)]);
}

/**
 * Recursively tries to push an item to the bottom-right most
 * tree possible. If there is no space left for the item,
 * null will be returned.
 * @param {*} item
 * @param {Node} list
 * @return {Node|null}
 */
function pushIfSpace(item, list) {
	// Handle recursion stop at leaf level.
	if (isLeaf(list)) {
		if (tableOf(list).length < M) {
			return new Node(0, tableOf(list).concat(item), void 0);
		}

		return null;
	}

	// Recursively push
	var pushed = pushIfSpace(item, lastSlot(list));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null) {
		var newA = nodeCopy(list);
		setLast(pushed, tableOf(newA));
		setLast(last(lengthsOf(newA)) + 1, lengthsOf(newA));
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (tableLenOf(list) < M) {
		var newSlot = createNodeWithHeight(item, heightOf(list) - 1);

		return new Node(heightOf(list),
			tableOf(list).concat(newSlot),
			lengthsOf(list).concat(last(lengthsOf(list)) + length(newSlot))
		);
	} else {
		return null;
	}
}

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
function append$1(a, b) {
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
			var _  = __append(lastSlot(a), firstSlot(b));
			var a0 = _[0];
			var b0 = _[1];

				insertRight(a, b0);
			insertLeft(b, a0);

		} else if (aHeight > bHeight) {
			a = nodeCopy(a);
			var _ = __append(lastSlot(a), b);
			var a0 = _[0];
			var b0 = _[1];

			insertRight(a, a0);
			b = parentise(b0, b0['@@rrb/height'] + 1);
		} else {
			b = nodeCopy(b);
			var _ = __append(a, firstSlot(b));

			var left = tableLenOf(_[0]) === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, _[left]);
			a = parentise(_[right], _[right]['@@rrb/height'] + 1);
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
	var newA = preSizedNodeOf(heightOf(a), Math.min(M, tableLenOf(a) + tableLenOf(b) - toRemove));
	var newB = preSizedNodeOf(heightOf(a), tableLenOf(newA) - (tableLenOf(a) + tableLenOf(b) - toRemove));

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
	var slot = preSizedNodeOf(heightOf(a) - 1, 0);
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
			slot = preSizedNodeOf(heightOf(a) - 1, 0);
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
function preSizedNodeOf(height, length$$1) {
	if (height > 0)
		return new Node(length$$1, new Array(length$$1), new Array(length$$1));

	return new Node(0, new Array(length$$1), void 0);
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

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes






// == public api list operations ======================================================================================

function push$1(item, list) {

	return pushIfSpace(item, list) || siblise(list, createNodeWithHeight(item, heightOf(list)));
}

function reverse$1(list) {
	return foldr$1((item, newList) =>
		push$1(item,newList), EMPTY, list);
}


function prepend(listA, listB) {
	return append$1(listB, listA);
}


function get$1(i, list) {
	if (i < 0 || i >= length(list)) {
		throw new Error('Index ' + i + ' is out of range');
	}
	return unsafeGet(i, list);
}


function set$1(i, item, list) {
	// if given index is negative, or greater than the length of list
	// be nice and don't throw an error
	// adding to the end of a list should always use push
	if (i < 0 || length(list) <= i) {
		return list;
	}
	return unsafeSet(i, item, list);
}

function insertAt$1(i, item, list) {
	// since slice is fast in rrb, try to use it instead of just filter
	return append$1(push$1(sliceLeft(i, list), item), sliceRight(i, list))

}

function removeAt$1(i, list) {
	return append$1(sliceLeft(i -1, list), sliceRight(i, list))
}

function removeItem$1(item, list) {
	var i = indexOf$1(item);
	return i === -1 ? list : remove(i, list);
}


const map$1 = curry(function map$1(fn, list, from = 0) {
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
			tbl[i] = map$1(fn, table[i],
				(i == 0 ? from : from + lengthsOf(list)[i - 1]));
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
const foldl$1 = curry(function foldl$1(fn, accum, list) {
	const table = tableOf(list);
	var len = table.length;
	if (isLeaf(list)) {
		for (var i = 0; len > i; i++) {
			accum = fn(table[i], accum);
		}
	} else {
		for (var i = 0; len > i; i++) {
			accum = foldl$1(fn, accum, table[i]);
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
const foldr$1 = curry(function foldr$1(fn, accum, list) {
	const table = tableOf(list);
	var i = table.length;
	if (isLeaf(list)) {
		while (i--) {
			accum = fn(table[i], accum);
		}
	} else {
		while (i--) {
			accum = foldr$1(fn, accum, table[i]);
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
const filter$1 = curry(function filter$1(fn, list) {
	return foldr$1((item, acc) =>
		(fn(item) ? push$1(item, acc) : acc), EMPTY, list);
});



/**
 * return a shallow copy of a portion of a list, with supplied "from" and "to"("to" not included)
 *
 * @param from
 * @param to
 * @param list
 */
function slice$2(from, to, list) {
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

function indexOf$1(value, list) {
	const table = tableOf(list);
	var i = table.length;
	if (isLeaf(list)) {
		while (i--) {
			if (table[i] === value)
			 return i;
		}
	} else {
		while (i--) {
			var subI = indexOf$1(value, table[i]);
			if (subI !== -1)
				return i + subI;
		}
	}
	return -1;
}







var ops = Object.freeze({
	push: push$1,
	reverse: reverse$1,
	append: append$1,
	prepend: prepend,
	get: get$1,
	set: set$1,
	insertAt: insertAt$1,
	removeAt: removeAt$1,
	removeItem: removeItem$1,
	map: map$1,
	foldl: foldl$1,
	foldr: foldr$1,
	filter: filter$1,
	slice: slice$2,
	indexOf: indexOf$1
});

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
function append$2(a, b) {
	if (tableLenOf(a) === 0) return b;
	if (tableLenOf(b) === 0) return a;

	var [a2, b2] = __append$1(a, b);

	// Check if both nodes can be crunshed together.
	var a2Table = a2['@@rrb/table'];
	var b2Table = b2['@@rrb/table'];
	var a2Height = a2['@@rrb/height'];

	if (a2Table + tableLenOf(b2) <= M) {
		if (a2Table.length === 0) return b2;
		if (b2Table.length === 0) return a2;


		// Adjust .table and .lengths
		a2['@@rrb/table'] = aTable.concat(b2Table);
		if (a2Height > 0) {
			var len = length(a2);
			let lengths = b2['@@rrb/lengths'];
			for (var i = 0, l = lengths.length; i < l; i++) {
				lengths[i] += len;
			}
			a2['@@rrb/lengths'] = a2['@@rrb/lengths'].concat(lengths);
		}

		return a2;
	}

	if (a2Height > 0) {
		var toRemove = calcToRemove$1(a, b);
		if (toRemove > E) {
			[a2, b2] = rebalance(a2, b2, toRemove);
		}
	}

	return siblise(a2, b2);
}

/**
 * Returns an array of two nodes; right and left. One node _may_ be empty.
 * @param {Node} left
 * @param {Node} right
 * @return {Array<Node>}
 * @private
 */
function __append$1(left, right) {
	if (isLeaf(left) && isLeaf(right)) {
		return [left, right];
	}

	var leftTable = left['@@rrb/table'];
	var leftHeight = left['@@rrb/height'];

	var rightTable = right['@@rrb/table'];
	var rightHeight = right['@@rrb/height'];

	if (leftHeight !== 1 || rightHeight !== 1) {
		if (leftHeight === rightHeight) {
			left = nodeCopy(left);
			right = nodeCopy(right);
			let [a0, b0]  = __append$1(lastSlot(left), firstSlot(right));

			insertRight$1(left, b0);
			insertLeft$1(right, a0);

		} else if (leftHeight > rightHeight) {
			left = nodeCopy(left);
			let [a0, b0] = __append$1(lastSlot(left), right);

			insertRight$1(left, a0);
			right = parentise(b0, b0['@@rrb/height'] + 1);
		} else {
			right = nodeCopy(right);
			let appended = __append$1(left, firstSlot(right));

			var x = appended[0]['@@rrb/table'].length === 0 ? 0 : 1;
			var y = x ^ 1;
			insertLeft$1(right, appended[x]);
			left = parentise(appended[y], heightOf(appended[y]) + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (tableLenOf(left) === 0 || tableLenOf(right) === 0) {
		return [left, right];
	}

	var toRemove = calcToRemove$1(left, right);
	if (toRemove <= E) {
		return [left, right];
	}
	return rebalance(left, right, toRemove);
}

// Helperfunctions for __append. Replaces a child node at the side of the parent.
function insertRight$1(parent, node) {
	var parentTable = parent['@@rrb/table'];
	var parentLengths = parent['@@rrb/lengths'];
	var index = parentTable.length - 1;
	parentTable[index] = node;
	parentLengths[index] = length(node) + (index > 0 ? parentLengths[index - 1] : 0);
}

function insertLeft$1(parent, node) {
	let lengths = parent['@@rrb/lengths'];
	let table = parent['@@rrb/table'];

	if (node['@@rrb/table'].length > 0) {
		table[0] = node;
		lengths[0] = length(node);

		var len = length(table[0]);
		for (let i = 1, l = lengths.length; l > i; i++) {
			lengths[i] = len = (len += length(table[i]));
		}

	} else {
		table.shift();
		for (let i = 1, l = lengths.length; l > i; i++) {
			lengths[i] = lengths[i] - lengths[0];
		}
		lengths.shift();
	}
}


/**
 * Returns an array of two balanced nodes.
 * @param {Node} left
 * @param {Node} right
 * @param {number} toRemove
 * @return {Array<Node>}
 */
function rebalance(left, right, toRemove) {
	var leftTable = left['@@rrb/table'];
	var rightTable = right['@@rrb/table'];
	var leftHeight = left['@@rrb/height'];
	var rightHeight = right['@@rrb/height'];
	var leftLengths = left['@@rrb/table'];
	var rightLengths = right['@@rrb/table'];

	var newA = preSizedNodeOf$1(leftHeight, Math.min(M, leftTable.length + rightTable.length - toRemove));
	var aTable = newA['@@rrb/table'];
	var aLengths = newA['@@rrb/lengths'];

	var newB = preSizedNodeOf$1(leftHeight, aTable.length - (leftTable.length + rightTable.length - toRemove));
	var bTable = newB['@@rrb/table'];
	var bLengths = newB['@@rrb/lengths'];

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (getEither$1(leftTable, rightTable, read)['@@rrb/table'].length % M === 0) {
		setEither$1(aTable, bTable, read, getEither$1(leftTable, rightTable, read));
		setEither$1(aLengths, bLengths, read, getEither$1(leftLengths, rightLengths, read));
		read++;
	}

	// Pulling items from left to right, caching in left slot before writing
	// it into the new nodes.
	var write = read;
	var slot = preSizedNodeOf$1(leftHeight - 1, 0);
	var slotTable = slot['@@rrb/table'];
	var slotTableLen = slotTable.length;
	var slotLengths = slot['@@rrb/lengths'];
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slotTable.length > 0 ? 1 : 0) < toRemove) {
		// Find out the max possible items for copying.
		var source = getEither$1(leftTable, rightTable, read);
		var to = Math.min(M - slotTableLen, tableLenOf(source));

		// Copy and adjust size table.
		slot['@@rrb/table'] = slotTable.concat(tableOf(source).slice(from, to));

		if (slot['@@rrb/height'] > 0) {
			var len = slotLengths.length;
			for (var i = len; i < len + to - from; i++) {

				slotLengths[i] = length(slotTable[i]) + (i > 0 ? slotLengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (tableLenOf(source) <= to) {
			read++;
			from = 0;
		}

		// Only create left new slot if the current one is filled up.
		if (slotTableLen === M) {
			saveSlot$1(newA, newB, write, slot);
			slot = preSizedNodeOf$1(leftHeight - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slotTableLen > 0) {
		saveSlot$1(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < leftTable.length + rightTable.length) {
		saveSlot$1(newA, newB, write, getEither$1(leftTable, rightTable, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Creates a node or leaf with a given length at their arrays for performance.
// Is only used by rebalance.
function preSizedNodeOf$1(height, length$$1) {
	if (height > 0)
		return new Node(length$$1, new Array(length$$1), new Array(length$$1));

	return new Node(0, new Array(length$$1), void 0);
}

/**
 * helper for setting picking a slot between to nodes
 * @param {Node} left - a non-leaf node
 * @param {Node} right - a non-leaf node
 * @param {number} index
 * @param {Node} slot
 */
function saveSlot$1(left, right, index, slot) {
	setEither$1(left['@@rrb/table'], right['@@rrb/table'], index, slot);

	let rightLengths = right['@@rrb/lengths'];
	let leftLengths = left['@@rrb/lengths'];
	let isInFirst = (index === 0 || index === leftLengths.length);
	let len = isInFirst ? 0 : getEither$1(leftLengths, leftLengths, index - 1);

	setEither$1(leftLengths, rightLengths, index, len + length(slot));
}

// getEither, setEither and saveSlot are helpers for accessing elements over two arrays.
function getEither$1(a, b, i) {
	return i < a.length ? a[i] : b[i - a.length];
}

function setEither$1(a, b, i, value) {
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
function calcToRemove$1(a, b) {
	var aTable = a['@@rrb/table'];
	var bTable = b['@@rrb/table'];
	var subLengths = sumOfLengths$1(aTable) + sumOfLengths$1(bTable);

	return (aTable.length + bTable.length) - (Math.floor((subLengths - 1) / M) + 1);
}

function sumOfLengths$1(table) {
	var sum = 0, len = table.length;
	for (var i = 0; len > i; i++)
		sum += table[i]['@@rrb/table'].length;

	return sum;
}

const {
	push: push$$1,
	append: append$$1,
	get: get$$1,
	set: set$$1,
	map: map$$1,
	slice: slice$$1,
	filter: filter$$1,
	foldr: foldr$$1,
	foldl: foldl$$1,
	insertAt: insertAt$$1,
	removeAt: removeAt$$1,
	removeItem: removeItem$$1,
	indexOf: indexOf$$1,
	reverse: reverse$$1} = ops;
const $$iter = Symbol.iterator || "@@iterator";
let proto = Node.prototype;


// == setup static methods ============================================================================================

Node.of = of;
Node.from = from;
Node.empty = empty;
Node.times = times;
//node.length is reserved, us lengthOf instead
Node.lengthOf = length;
Node.push = push$$1;
Node.append = append$$1;
Node._append = append$2;
Node.get = get$$1;
Node.set = set$$1;
Node.map = map$$1;
Node.slice = slice$$1;
Node.filter = filter$$1;
Node.foldr = foldr$$1;
Node.foldl = foldl$$1;
Node.reverse = reverse$$1;
Node.removeAt = removeAt$$1;
Node.removeItem = removeItem$$1;
Node.indexOf = indexOf$$1;



// == setup list prototype ============================================================================================

// iterator support
proto[$$iter]         = function() {
	return iterator(this);
};
proto.values          = function() {
	return iterator(this);
};
proto.valuesInReverse = function() {
	return tailIterator(this);
};

// metadata
proto.isEmpty  = () => false; // small optimization because all empty lists are the same element
proto.size     = function() { return length(this); };

// list operations
proto.append   = function(list) { return append$$1(this, list); }; //append only accepts a list(does not behave like Array#concat)
proto.prepend  = function(list) { return append$$1(list, this); };
proto.push     = function(item) { return push$$1(item, this); };
proto.get      = function(i) { return get$$1(i, this); };
proto.set      = function(i, item) { return set$$1(i, item, this); };
proto.foldl    = function(fn, acc) { return foldl$$1(fn, acc, this); };
proto.foldr    = function(fn, acc) { return foldr$$1(fn, acc, this); };
proto.slice    = function(from$$1 = 0, to) { return slice$$1(from$$1, to || this.length, this); };
proto.head     = function() { return this.get(0); };
proto.tail     = function() { return this.slice(1); };
proto.filter   = function(fn) { return filter$$1(fn, this); };
proto.reverse  = function() { return reverse$$1(this); };

proto.toArray  = function() { return foldl$$1(addTo, [], this); };

function addTo(value, array) {
	array.push(value);
	return array;
}

// == fantasy-land compatibility ======================================================================================

proto.of = function(item) {								// Applicative compat
	return one(item);
};

proto.chain = proto.concatMap = function(f) {
	//note: this is single level concat, but most functional level concat
	// rules define this as fully recursive
	return foldr$$1((value, acc) =>
			_concat(f(value), acc), EMPTY, this);

	// recursive concat ???

	// function _concat(list) {
	// 	if (list.length === 0)
	// 		return empty();
	// 	return list.head().concat(_concat(list.tail()));
	// }
	//
	// return _concat(this.map(f));
};

// rules of applicative
// 1) assume 'this' is an collection of functions
// 2) assume argument is an array of values
// 3) return an array of values, where every function in  this has been applied
proto.ap = function(values) {
	return this.map(fn =>
		values.map(fn));
};


proto.map      = function(fn) { return map$$1(fn, this); };// Functor compat. todo: verify this works, we accept 2 args instead of requiring 1
proto.empty = empty;									// Monoid compat
function _concat(thing, list) {						// Semigroup compat
	if (isListNode(thing)) return append$$1(list, thing); // if a semigroup is provided, must return same type

	return push$$1(thing, list); // if not a semigroup, behavior is not specified
}
proto.concat = function (value) {
	return _concat(value, this);
};

proto[fl.of] = of;
Node[fl.of]  = of;
proto[fl.empty] = empty;
Node[fl.empty]  = empty;
proto[fl.ap] = proto.ap;
Node[fl.ap]  = proto.ap;
proto[fl.map] = proto.map;
Node[fl.map]  = proto.map;
proto[fl.chain] = proto.chain;
Node[fl.chain]  = proto.chain;
proto[fl.concat] = proto.concat;
Node[fl.concat]  = proto.concat;


// == exports ========================================================================================================


// one last thing to do now that we've finished modifying it
Object.freeze(EMPTY);

module.exports = Node;
