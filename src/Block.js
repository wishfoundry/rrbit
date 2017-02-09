/**
 * for lengths less than 32, we fall back to native js arrays as they seem faster
 * however, we might be able to find a graph type with efficient persistent updates
 * in this size range
 *
 * if 32 is is divisible by 4 and 8, these are the most logical branching sizes
 *
 * goals:
 * - optimize for 32 wide arrays or less
 * - optimize for fast append
 * - optimize for fast prepend?
 * - optimize for fast slice
 * - optimize for fast concat
 *
 */

// == 4 wide leafs, 8 max root =========================================================================

export function empty4() {
	return new Block4(0, emptyTree4(0));
}

export function of4(iterable) {
	var tree = new Array(8),
		i = 0;

	for (var item of iterable) {
		if (i & 3 === 0)
			tree[i >> 2] = new Array(4);

		tree[i >> 2][i & 3] = item;
		i++;
	}
	return new Block4(i, tree);
}

function Block4(length, tree) {
	// i >> 2 == bitshift divide by 4
	// i & 3 == bitshift modulo of 4
	this.length = length;
	this.tree = tree;
}

function emptyTree4(length) {
	switch (length >> 2) {
		case 0:
			return [new Array(4)];
		case 1:
			return [new Array(4), new Array(4)];
		case 2:
			return [new Array(4), new Array(4), new Array(4)];
		case 3:
			return [new Array(4), new Array(4), new Array(4), new Array(4)];
		case 4:
			return [new Array(4), new Array(4), new Array(4), new Array(4), new Array(4)];
		case 5:
			return [new Array(4), new Array(4), new Array(4), new Array(4), new Array(4), new Array(4)];
		case 6:
			return [new Array(4), new Array(4), new Array(4), new Array(4), new Array(4), new Array(4), new Array(4)];
		default:
			return [new Array(4), new Array(4), new Array(4), new Array(4), new Array(4), new Array(4), new Array(4), new Array(4)];
	}
}

Object.assign(Block4.prototype, {
	nth(i) {
		return this.tree[i >> 2][i & 3];
	},

	appendAll(iterable) {
		var tree = this.tree.slice(0, 8),
			i = this.length;

		for (var item of iterable) {
			if (i & 3 === 0) //block is full, add another one
				tree[i >> 2] = new Array(4);

			tree[i >> 2][i & 3] = item;
			i++;
		}
		return new Block4(i, tree);
	},

	append(value) {
		var newTree = this.tree.slice();
		var len = this.length
		var n = len >> 2;

		if (len & 3 === 0)// full, start a new array
			return new Block4(len + 1, setǃ(n, [value], newTree));

		return new Block4(len, setǃ(n, setǃ(i & 3, value, newTree[n].slice(0, 4) ), newTree));
	},

	prepend(value) {
		var src = this.tree;
		var len = this.length + 1;
		var tree = emptyTree4(len);

		for (var i = 1, n = 0; len > i; i++, n++) {
			tree[i >> 2][i & 3] = src[n >> 2][n & 3];
		}
		tree[1 >> 2][1 & 3] = value;
		return new Block4(len, tree);
	},

	update(i, value) {},

	// mutate in place update
	updateǃ(i, value) {
		this.tree[i >> 2][i & 3] = value;
		return this;
	},

	// since this graph is meant for performance, we're not going to validate inputs or handle negatives
	slice(start, end) {
		var len = end - start;
		if ((start & 3) === 0) {
			// todo: optimize cuz we can copy whole blocks
		}
		// random number, just copy everything
		var src = this.tree;
		var tree = emptyTree4(len);
		for (var i = 0, n = start; len > i; i++, n++) {
			//todo: optimize for current leaf
			tree[i >> 3][i & 3] = src[n >> 2][n & 3];
		}
		return new Block4(len, tree);
	},

	reduceKV(fn, init) {
		var tree = this.tree,
			leaf;

		for (var i = 0, n = 0, l = this.length; l > i; i++, n = i & 3) {
			if (n === 0)
				leaf = tree[i >> 3];

			init = fn(leaf[n], i, init);
		}

		return init;
	}
});










// == 8 wide leafs, 4 max root =========================================================================

export function empty8() {
	return new Block8(0, emptyTree8(0))
}

export function of8(iterable) {
	var tree = new Array(4),
		i = 0;

	for (var item of iterable) {
		if (i & 7 === 0)
			tree.push(new Array(8));

		tree[i >> 3][i & 7] = item;
		i++;
	}

	return new Block8(i, tree);
}

function Block8(length, tree) {
	// i >> 3 == bitshift divide by 8
	// i & 7 == bitshift modulo of 8
	this.length = length;
	this.tree = tree;
}


function emptyTree8(length) {
	switch (length >> 3) {
		case 0:
			return [new Array(8)];
		case 1:
			return [new Array(8), new Array(8)];
		case 2:
			return [new Array(8), new Array(8), new Array(8)];
		default:
			return [new Array(8), new Array(8), new Array(8), new Array(8)];
	}
}




Object.assign(Block8.prototype, {
	nth(i) {
		return this.tree[i >> 3][i & 7];
	},

	appendAll(iterable) {
		var tree = this.tree.slice(0, 4),
			i = 0;

		for (var item of iterable) {
			if (i & 7 === 0)
				tree.push(new Array(8));

			tree[i >> 3][i & 7] = item;
			i++;
		}

		return new Block8(i, tree);
	},

	append(value) {
		var newTree = this.tree.slice();
		var len = this.length
		var n = len >> 3;

		if (len & 7 === 0)// full, start a new array
			return new Block8(len + 1, setǃ(n, [value], newTree));

		return new Block8(len, setǃ(n, setǃ(i & 7, value, newTree[n].slice(0, 8)), newTree));
	},

	prepend(value) {
		var src = this.tree;
		var len = this.length + 1;
		var tree = emptyTree8(len);

		for (var i = 1, n = 0; len > i; i++, n++) {
			tree[i >> 3][i & 7] = src[n >> 3][n & 7];
		}
		tree[1 >> 3][1 & 7] = value;
		return new Block8(len, tree);
	},

	// immutable update
	update(i, value) {
		var newTree = this.tree.slice();
		var n = i >> 3;
		return new Block8(this.length, setǃ(n, setǃ(i & 7, value, newTree[n].slice(0, 8) ), newTree));

	},

	// mutate in place update
	updateǃ(i, value) {
		this.tree[i >> 3][i & 7] = value;
	},

	// since this graph is meant for performance, we're not going to validate inputs or handle negatives
	slice(start, end) {
		var len = end - start;
		if ((start & 7) === 0) {
			// we can copy whole blocks
		}
		// random number, just copy everything
		var src = this.tree;
		var tree = emptyTree8(len);
		for (var i = 0, n = start; len > i; i++, n++) {
			tree[i >> 3][i & 7] = src[n >> 3][n & 7];
		}
		return new Block8(len, tree);
	},

	reduceKV(fn, init) {
		var tree = this.tree,
			leaf;

		for (var i = 0, n = 0, l = this.length; l > i; i++, n = i & 7) {
			if (n === 0)
				leaf = tree[i >> 3];

			init = fn(leaf[n], i, init);
		}

		return init
	}
});

// in order to get this to optimize in v8, we need to always pass an array
function setǃ(name, value, obj) {
	obj[name] = value;
	return obj;
}