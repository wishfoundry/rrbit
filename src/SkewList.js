/**
 * an implementation of okasaki's Skewed Binary Access List(a.k.a. random access list)
 *
 * http://citeseer.ist.psu.edu/viewdoc/download?doi=10.1.1.55.5156&rep=rep1&type=pdf
 *
 * a higher performing alternative to Cons lists with
 *  > O(1) time cons, head, tail operations
 *  > O(n) time lookup, update operations
 *
 *
 */
export default function SkewList(nodes) {
	if (!(this instanceof SkewList))
		return new SkewList(nodes);

	this.nodes = nodes || [];
}

function Node(size, value, right, left) {
	this.size = size;
	this.value = value;
	this.right = right;
	this.left = left;
}

// = constructors ====================================================

function of(...args) {
	return from(args);
}

function from(iterable) {
	var list = new SkewList();
	for (var item of iterable)
		list = cons(item, list);

	return list
}

SkewList.of = of;
SkewList.from = from;

function _list(array) {
	var list = new SkewList();
	if (array)
		list.nodes == array;

	return list;
}

// = operations ======================================================

export function lengthOf(list) {
	var len = 0
		, nodes = list.nodes
		, ll = nodes.length;
	for (var i = 0; ll > i; i++) {
		len += nodes[i].size
	}
	return len;
}

/**
 * append value to beginning of list and return a new list
 *
 * @param {T} value
 * @param {SkewList<T>} list
 * @returns {SkewList<T>}
 */
export function cons(value, list) {
	var nodes = list.nodes;
	if (nodes.length < 2 || // don't even have 2 trees
		nodes[0].size < nodes[1].size) { //have 2 trees, different sizes
		return _list([new Node(1, value, null, null), ...nodes])
	}

	return _list([new Node(nodes[0].size * 2 + 1, value, nodes[1], nodes[0])].concat(nodes.slice(2));
}

/**
 * get the value at index or,
 * if out of range return notFound
 *
 * (bring your own Maybe/Error types)
 *
 * @param {Number} i
 * @param {SkewList<T>} list
 * @param notFound
 * @returns {T|notFound}
 */
export function nth(i, list, notFound) {
	var nodes = list.nodes;
	for (var node of nodes) {
		if (node.size <= i) {
			i -= node.size;
			continue;
		}
		while (i > 0) {
			if (i >= (1 + node.size) / 2) { // Go right, -2^i
				i -= (1 + node.size) / 2;
				node = node.right;
			} else { // Go left, -1
				i -= 1;
				node = node.left;
			}
		}
		return node.value;
	}
	return notFound;
}

/**
 * create a new list and set the value at index
 *
 * @param {number} i
 * @param {T} value
 * @param {SkewList<T>} list
 * @returns {SkewList<T>}
 */
export function update(i, value, list) {
	var nodes = list.nodes;
	for (var node of nodes) {
		if (node.size <= i) {
			i -= node.size;
			continue;
		}
		var items = nodes.slice();
		items.splice(i, 1, updateTree(i, value, node));
		return _list(items);
	}
	return list; // nothing found so ???
}

function updateTree(i, value, tree) {

	//todo: convert to looping form to prevent possible stack overflow
	if (i === 0)
		return new Node(tree.size, value, tree.right, tree.left);

	if (i >= (1 + tree.size) / 2)
		return new Node(tree.size, tree.value, updateTree(i - ((1 + tree.size) / 2), tree.right), tree.left);

	return new Node(tree.size, tree.value, tree.right, updateTree(i - 1, tree.left));
}


/**
 * return a new list without the first item
 * if list is empty, return notFound
 *
 * @param {SkewList} list
 * @param {*} notFound
 * @return {SkewList|notFound}
 */
export function tail(list, notFound) {
	if (isEmpty(list))
		return notFound;

	var nodes = list.nodes;
	var [first, ...rest] = nodes;

	if (first.size == 1)
		return _list(rest);

	return _list([first.left, first.right, rest]);
}


/**
 *
 * (bring your own Maybe/Error types)
 *
 * @param {SkewList<T>} list
 * @param notFound
 * @return {T|notFound}
 */
export function head(list, notFound) {
	return isEmpty(list) ? notFound : list.nodes[0].value;

}


export function isEmpty(list) {
	return list.nodes.length === 0;
}


function mapTree(fn, tree) {

	if (tree.size === 1)
		return new Node(1, fn(tree.value), null, null);

	var value = fn(tree.value);
	var left = mapTree(fn, tree.left);
	var right = mapTree(fn, tree.right);
	return new Node(tree.size, value, right, left);
}

/**
 * optimized map routine
 * does not pass index(functional style signature), reuses existing array "shape"
 *
 * to get a more js like map(e.g. with function(T, Number) signature), use kvMap
 *
 * @param {function(T)} fn
 * @param {SkewList<T>} list
 */
export function map(fn, list) {
	var nodes = list.nodes
		, len = nodes.length
		, roots = new Array(len);
	for (var i = 0; len > i; i++) {
		roots[0] = mapTree(fn, node);
	}
	return _list(roots);
}

/**
 *
 * @param {function(T, Number)} fn
 * @param {SkewList<T>} list
 * @return {SkewList<T>}
 */
export function kvMap(fn, list) {
	// since we can only cons to the front of a list,
	// we iterate through the list backwards to maintain proper ordering
	return kvReduceRight((acc,  i, value) =>
		acc.unshift(fn(value, i)), _list(), list);
}

/**
 *
 * @param {function(seed, Number, T)} fn
 * @param {*} seed
 * @param {SkewList<T>} list
 * @return {seed}
 */
export function kvReduce(fn, seed, list) {
	var i = 0,
		inc = () => i++;
	for (var item of list) {
		seed = fn(seed, inc(), item);
	}
	return seed;
}

/**
 * reduce in reverse order
 * @param {function(seed, Number, T)} fn
 * @param {*} seed
 * @param {SkewList<T>} list
 * @return {seed}
 */
export function kvReduceRight(fn, seed, list) {
	var len = lengthOf(list);
	for (var item of reverseIter(list)) {
		seed = fn(seed, len--, item);
	}
	return seed;
}

// = iterators =====================================================================

function* iterTree(node) {
	yield node.value;
	if (node.left)
		yield iterTree(node.left);

	if (node.right)
		yield iterTree(node.right);
}

export function* iterator(list) {
	for (var node of list.nodes) {
		yield iterTree(node);
	}
}

function* _revTreeIter(node) {
	if (node.right)
		yield _revTreeIter(node.right);

	if (node.left)
		yield _revTreeIter(node.left);

	yield node.value;
}

export function* reverseIter(list) {
	var nodes = list.nodes;
	var i = nodes.length;
	while(i--) {
		yield _revTreeIter(nodes[i]);
	}
}





var proto = SkewList.prototype;
proto[Symbol.iterator] = function() { return iterator(this); };
proto.get = function(i, notFound) { return nth(i, this, notFound); };
proto.set = function(i, value) { return update(i, value, this); };
proto.head = function(notFound) { return head(this, notFound); };
proto.isEmpty = function() { return isEmpty(this); };
proto.map = function(fn) { return map(fn, this); };
proto.tail = function() { return tail(this); };
proto.head = function() { return head(this); };
proto.unshift = proto.cons = function(value) { return cons(value, this); };

proto.reduce = function(fn, value) {
	for (var item of this) {
		value = fn(value, item);
	}
	return value;
};


SkewList.empty = proto.empty = () => new SkewList();

Object.defineProperty(proto, 'length', {
	configurable: false,
	writable: false,
	get: function() {
		return lengthOf(this);
	}
});

