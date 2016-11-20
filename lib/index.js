'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fl = _interopDefault(require('fantasy-land'));

const _slice = Array.prototype.slice;
function slice(from, to, array) {
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
function isLeaf$1(node) {
	return node['@@rrb/height'] === 0;
}

// get the # of elements in a rrb list
function length(list) {
	return isLeaf$1(list) ? list['@@rrb/table'].length : last(list['@@rrb/lengths']);
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
Node.prototype.size     = function() { return length(this); };

Object.defineProperty(Node.prototype, 'length', {
	get() {
		return this.size();
	},
	set(value) {
		//do nothing
	}
});

const EMPTY = Object.freeze(Object.assign(new Node(0, [], void 0), {
	isEmpty() { return true; },
	size() { return 0; }
}));



function isNode(item) {
	return item instanceof Node;
}

Node.prototype.empty = empty;

Node.empty = empty;

function empty() {
	return EMPTY;
}

Node.one = one;

// performance shortcut for an array of one
function one(item) {
	return new Node(0, [ item ], void 0);
}

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
const M = 32;
const E = 2;

/**
 * create an rrb vector from a js array
 * note: this is meant for internal use only. public usage should be with List.from()
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
			return new Node(0, slice(from, to, jsArray), void 0);
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

Node.of = of;

function of(first, ...rest) {

	if (typeof first === 'undefined')
		return EMPTY;

	if (rest && rest.length > 0)
		return fromArray([first].concat(rest));

	return one(first);
}

Node.times = times;

/**
 * populate an array using provided function
 *
 * @param len
 * @param {function(number)} fn
 * @return {Node}
 */
function times(fn, len) {
	if (len <= 0)
		return EMPTY;

	// just iterating over push() isn't terribly fast...
	// we attempt to optimize here by pre-allocating

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
		return new Node(0, table, void 0);
	}
}

Node.from = from;

/**
 * the default list constructor
 * accepts an single native array, varargs, or nothing(if an empty list is desired)
 *
 */
function from(iterable, mapFn) {
	var list = EMPTY;

	if (isNode(iterable)) {
		return iterable;
	}

	// use more performant, pre-allocation technique when possible
	if (Array.isArray(iterable)) {
		return !mapFn ? fromArray(iterable) : times((i) => mapFn(iterable[i], i), iterable.length);
	}

	// if length is unknown, just use slower push
	if (mapFn) {
		for (var item of iterable) {
			list = list.push(mapFn(item));
		}
	} else {
		for (var item of iterable) {
			list = list.push(item);
		}
	}

	return list;
}

Node.range = range;

function range(from, to) {
	var len = to - from;
	return times((i) => from + i, len);
}

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
	if (isLeaf$1(list))
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
	if (isLeaf$1(list))
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

	if (isLeaf$1(list)) {
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
	return new Node(heightOf(a), copy(tableOf(a)), (isLeaf$1(a) ? void 0: copy(lengthsOf(a))) );
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
	if (isLeaf$1(list)) {
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


function push(item, list) {

	return pushIfSpace(item, list) || siblise(list, createNodeWithHeight(item, heightOf(list)));
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
function append$2(a, b) {
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
function allocate(height, length$$1) {
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

Node.prototype.append = function (a, b) {
	return append$2(a, this);
};

const append$$1 = Node.append = curry(append$2);

/**
 * A pattern match/guard helper for functional style switch statements
 *
 * accepts an array or object of function case handlers
 *
 * array style, read each functions # of arguments and selects that case when
 * list length matches, or uses the last array item when none
 *
 * object style, uses matches on object's 'key' as the length
 * default case key is '_'
 *
 * ```
 * //example using array syntax(last item is "default" fallback)
 * let getLast = List.switch([
 *     () => [],
 *     (a) => [a],
 *     (_, b) => [b],
 *     (...items) => [items[items.length]]
 * ])
 * ```
 *
 * ```
 * //example using object syntax("_" is "default" fallback)
 * let add1 = List.switch([
 *     "0": () => [],
 *     "1": (a) => [a + 1],
 *     "_": (...items) => items.map(i => i + a)
 * ])
 * ```
 *
 *
 * @param {Object|Array}patterns
 * @return {Function}
 */
function arrayCaseSwitch(patterns) {
	/**
	 * @param {List} list
	 */
	return function(list) {
		var len = list.length;

		for (var i = 0, l = patterns.length; l > i; i++) {
			var fn = patterns[i];
			if (fn.length === len);
			return fn.call(null, ...list.slice(0, i));
		}

		// if we didn't find a match, assum the last function is the "default" case
		return last(patterns).call(null, ...list);
	}
}


function objectCaseSwitch(patterns) {
	/**
	 * @param {List} list
	 */
	return function(list) {
		var len = list.length;

		var fn = patterns[len];
		if (fn)
			return fn.call(null, ...list.slice(0, len));

		let fallback = patterns["_"] || patterns["*"];

		if (fallback)
			return fallback.call(null, ...list.slice(0, len));
	}
}


Node.caseOf = function(patterns) {
	if (Array.isArray(patterns)) {
		return arrayCaseSwitch(patterns);
	}

	if (typeof patterns == "object") {
		return objectCaseSwitch(patterns);
	}

	throw new TypeError("invalid switch descriptor provided")
};

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
function _foldr(fn, accum, list) {
	const table = tableOf(list);
	var i = table.length;
	if (isLeaf$1(list)) {
		while (i--) {
			accum = fn(table[i], accum);
		}
	} else {
		while (i--) {
			accum = foldr(fn, accum, table[i]);
		}
	}
	return accum;
}

Node.prototype.foldr = Node.foldr = function(fn, seed) {
	return _foldr(fn, seed, this);
};

const foldr = Node.foldr = curry(_foldr);

/**
 * return a new list of items that pass test fn
 *
 * @param {function(T)} fn
 * @param {Node<T>} list
 * @return {Node<T>}
 */
function _filter(fn, list) {
	return foldr((item, acc) =>
		(fn(item) ? push(item, acc) : acc), EMPTY, list);
}

Node.prototype.filter = function(fn) {
	return _filter(fn, this);
};

const filter = Node.filter = curry(_filter);

/**
 *
 * @param {function}predicate
 * @param {List} list
 * @return {*}
 * @private
 */
function _find(predicate, list) {
	for (var item of list) {
		if (predicate(item))
			return item;
	}
}

const find = Node.find = curry(_find);

Node.prototype.find = function(predicate) {
	return _find(predicate, this);
};

/**
 * fold left(reverse)
 *
 * @param {function(T, Z)} fn
 * @param {Z} accum
 * @param {Node<T>} list
 * @return {*}
 */
function _foldl(fn, accum, list) {
	const table = tableOf(list);
	var len = table.length;
	if (isLeaf$1(list)) {
		for (var i = 0; len > i; i++) {
			accum = fn(table[i], accum);
		}
	} else {
		for (var i = 0; len > i; i++) {
			accum = foldl(fn, accum, table[i]);
		}
	}
	return accum;
}

Node.prototype.foldl = function(fn, seed) {
	return _foldl(fn, seed, this);
};

const foldl = Node.foldl = curry(_foldl);

function _get(i, list) {
	if (i < 0 || i >= length(list)) {
		throw new Error('Index ' + i + ' is out of range');
	}
	return unsafeGet(i, list);
}

Node.prototype.get = function(i) {
	return _get(i, this);
};

const get = Node.get = curry(_get);

/**
 *
 * @param value
 * @param list
 * @return {*}
 */
function _indexOf(value, list) {
	const table = tableOf(list);
	var i = table.length;
	if (isLeaf$1(list)) {
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

function _isMember(item, list) {
	return indexOf(item, list) !== -1;
}


Node.prototype.indexOf = function(value) {
	return indexOf(value, this);
};

Node.prototype.isMember = function(item, list) {
	return indexOf(item, list) !== -1;
};


const indexOf = Node.indexOf = curry(_indexOf);
const isMember = Node.isMember = curry(_isMember);

/**
 *
 * @param i
 * @param item
 * @param list
 * @return {Node}
 * @private
 */
function _insertAt(i, item, list) {

	// since slice is fast in rrb, try to use it instead of just filter
	return append$2(push(sliceLeft(i, list), item), sliceRight(i, list))
}


const insertAt = Node.insertAt = curry(_insertAt);

Node.prototype.insertAt = function(i, item) {
	return _insertAt(i, item, this);
};

/**
 * return a shallow copy of a portion of a list, with supplied "from" and "to"("to" not included)
 *
 * @param {number} from
 * @param {number=} to
 * @param {} list
 */
function _slice$1(from, to, list) {
	if (isNode(to)) {
		list = to;
		to = length(list);
	}
	const max = length(list);

	if (from >= max) {
		return EMPTY;
	}

	if (to >= max - 1) {
		to = max;
	}

	//invert negative numbers
	function confine(i) {
		return i < 0 ? (i + max) : i;
	}

	return sliceLeft(confine(from), sliceRight(confine(to), list));
}

// unfortunately we can't curry slice as we're forced to accept current js
// conventions with varying args
const slice$1 = Node.slice = _slice$1;

Node.prototype.slice = function(from, to) {
	return _slice$1(from, to, this);
};

function tail(list) {
	return slice$1(1, length(list), list);
}

//pop first element and wrap in a list
function head(list) {
	return slice$1(0,1, list);
}

function prepend(pre) {
	return function fold(value, list) {
		return push(value, push(pre, list));
	}
}

/**
 * Inject a value between all members of the list.
 *
 * ```
 * intersperse(",", ["one", "two", "three"])  ==  ["one", ",", "two", ",", "three"]
 * ```
 * @param separator
 * @param {List} list
 * @return {List}
 * @private
 */
function _intersperse(separator, list) {
	if (!length(list))
		return EMPTY;

	return foldr(prepend(separator), head(list), tail(list))
}

const intersperse = Node.intersperse = curry(_intersperse);

Node.prototype.intersperse = function(separator) {
	return intersperse(separator, this);
};

function _map(fn, list, from = 0) {
	const table = tableOf(list);
	const len = table.length;
	var tbl = new Array(len);

	// we're micro optimizing for the common use case here, foldr could replace this just fine
	// but since we're not changing the length, we can skip over some table reshuffling
	if (isLeaf$1(list)) {
		for (var i = 0; len > i; i++) {
			tbl[i] = fn(table[i], from + i);
		}
	} else {
		for (var i = 0; len > i; i++) {
			tbl[i] = map(fn, table[i],
				(i == 0 ? from : from + lengthsOf(list)[i - 1]));
		}
	}


	return new Node(heightOf(list), tbl, lengthsOf(list));
}

Node.prototype.map = function(fn) {
	return _map(fn, this);
};

const map = Node.map = curry(_map);

function _prepend(listA, listB) {
	return append$2(listB, listA);
}

Node.prototype.prepend = function (list) {
	return append$2(list, this);
};

const prepend$1 = Node.prepend = curry(_prepend);

Node.prototype.push = function(item) {
	return push(item, this);
};

const push$1 = Node.push = curry(push);

function _removeAt(i, list) {
	return append$2(sliceLeft(i - 1, list), sliceRight(i, list))
}

function _removeItem(item, list) {
	var i = indexOf(item);
	return i === -1 ? list : remove(i, list);
}

const removeAt = Node.removeAt = curry(_removeAt);
const removeItem = Node.removeItem = curry(_removeItem);

function _reverse(list) {
	return foldr((item, newList) =>
		push(item,newList), EMPTY, list);
}

Node.prototype.reverse = function() {
	return reverse(this);
};

const reverse = Node.reverse = curry(_reverse);

function _set(i, item, list) {
	// if given index is negative, or greater than the length of list
	// be nice and don't throw an error
	// adding to the end of a list should always use push
	if (i < 0 || length(list) <= i) {
		return list;
	}
	return unsafeSet(i, item, list);
}

Node.prototype.set = function(i, item) {
	return _set(i, item, this);
};

const set = Node.set = curry(_set);

/**
 *
 * Monoid

 A value that implements the Monoid specification must also implement the Semigroup specification.

 m.concat(M.empty()) is equivalent to m (right identity)
 M.empty().concat(m) is equivalent to m (left identity)
 empty method

 empty :: Monoid m => () -> m
 A value which has a Monoid must provide an empty function on its type representative:

 M.empty()
 Given a value m, one can access its type representative via the constructor property:

 m.constructor.empty()
 empty must return a value of the same Monoid

 */

Node[fl.empty] = Node.prototype[fl.empty] = empty;

/**
 * Functor

 u.map(a => a) is equivalent to u (identity)
 u.map(x => f(g(x))) is equivalent to u.map(g).map(f) (composition)
 map method

 map :: Functor f => f a ~> (a -> b) -> f b
 A value which has a Functor must provide a map method. The map method takes one argument:

 u.map(f)
 f must be a function,

 If f is not a function, the behaviour of map is unspecified.
 f can return any value.
 No parts of f's return value should be checked.
 map must return a value of the same Functor
 *
 */

Node.prototype[fl.map] = function(fn) {
	//our standard map provides arguments, but pure functional map is only 1
	return this.map((value, i) => fn(value));
};

/**
 *
 * Apply

 A value that implements the Apply specification must also implement the Functor specification.

 v.ap(u.ap(a.map(f => g => x => f(g(x))))) is equivalent to v.ap(u).ap(a) (composition)
 ap method

 ap :: Apply f => f a ~> f (a -> b) -> f b
 A value which has an Apply must provide an ap method. The ap method takes one argument:

 a.ap(b)
 b must be an Apply of a function,

 If b does not represent a function, the behaviour of ap is unspecified.
 a must be an Apply of any value

 ap must apply the function in Apply b to the value in Apply a

 No parts of return value of that function should be checked.



 Applicative

 A value that implements the Applicative specification must also implement the Apply specification.

 v.ap(A.of(x => x)) is equivalent to v (identity)
 A.of(x).ap(A.of(f)) is equivalent to A.of(f(x)) (homomorphism)
 A.of(y).ap(u) is equivalent to u.ap(A.of(f => f(y))) (interchange)
 of method

 of :: Applicative f => a -> f a
 A value which has an Applicative must provide an of function on its type representative. The of function takes one argument:

 F.of(a)
 Given a value f, one can access its type representative via the constructor property:

 f.constructor.of(a)
 of must provide a value of the same Applicative

 No parts of a should be checked
 *
 */

function ofOne(item) {
	return one(item);
}

function ap(values) {
	return this.map(fn => values.map(fn));
}

// required on all instances for Applicative compat
Node.prototype.of = Node.prototype[fl.of] = ofOne;
Node[fl.ap] = Node.prototype.ap = Node.prototype[fl.ap] = ap;


// List.prototype.ap = List.prototype[fl.ap] = function ap(other) {
// 	return this.map(f => other.map(x => f(x))).flatten()
// };

/**
 *
 * Chain

 A value that implements the Chain specification must also implement the Apply specification.

 m.chain(f).chain(g) is equivalent to m.chain(x => f(x).chain(g)) (associativity)
 chain method

 chain :: Chain m => m a ~> (a -> m b) -> m b
 A value which has a Chain must provide a chain method. The chain method takes one argument:

 m.chain(f)
 f must be a function which returns a value

 If f is not a function, the behaviour of chain is unspecified.
 f must return a value of the same Chain
 chain must return a value of the same Chain
 *
 */

function _concat(thing, list) {						// Semigroup compat
	if (isNode(thing))
		return append$2(list, thing); // if a semigroup is provided, must return same type

	return push(thing, list); // if not a semigroup, behavior is not specified
}

function chain(f) {
	//note: this is single level concat, but most functional level concat
	// rules define this as fully recursive... do we need to?
	return foldr((value, acc) =>
		_concat(f(value), acc), EMPTY, this);

	// recursive concat ???

	// function _concat(list) {
	// 	if (list.length === 0)
	// 		return empty();
	// 	return list.head().concat(_concat(list.tail()));
	// }
	//
	// return _concat(this.map(f));
}

Node.prototype[fl.chain] = Node.prototype.chain = Node.prototype.flatMap = chain;

/**
 *
 *
 * Semigroup

 a.concat(b).concat(c) is equivalent to a.concat(b.concat(c)) (associativity)
 concat method

 concat :: Semigroup a => a ~> a -> a
 A value which has a Semigroup must provide a concat method. The concat method takes one argument:

 s.concat(b)
 b must be a value of the same Semigroup

 If b is not the same semigroup, behaviour of concat is unspecified.
 concat must return a value of the same Semigroup.

 *
 */

function _concat$1(thing, list) {						// Semigroup compat
	if (isNode(thing))
		return append$2(list, thing); // if a semigroup is provided, must return same type

	return push(thing, list); // if not a semigroup, behavior is not specified
}

function concat(value) {
	return _concat$1(value, this);
}

Node.prototype[fl.concat] = Node.prototype.concat = concat;

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
	return isLeaf$1(list) ? _leafIterator(list) : _nodeIterator(list);

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

const $$iter = (Symbol && Symbol.iterator) || "@@iterator";

Node.prototype[$$iter] = function() {
	return iterator(this);
};

// last minute addons
Node.isList = isNode;
Node.prototype.toArray  = function() {
	return this.foldl(addTo, [], this);
};
function addTo(value, array) {
	array.push(value);
	return array;
}

module.exports = Node;
