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

// in order to get this to optimize in v8, we need to always pass an array
function setǃ(name, value, obj) {
	obj[name] = value;
	return obj;
}


function BlockFactory(LEAFWIDTH) {
	if (LEAFWIDTH & (LEAFWIDTH - 1) !== 0) {
		throw new Error('width must be a power of 2');
	}
	var ROOTWIDTH = 32 / LEAFWIDTH;
	var ROOTBIT = Math.log2(LEAFWIDTH);
	var LEAFBIT = LEAFWIDTH - 1;

	// bit operations explained:
	// bitshift divide. determine which root to plug our value in
	// i >> ROOTBIT
	// bitshift modulo, determine which slot in leaf minus the root offset to set value
	// i & LEAFBIT

	function emptyTree(length) {
		var len = length >> ROOTBIT;
		var tree = new Array(len)

		// use a switch for performance
		switch (len) {
			case 8:
				tree[7] = new Array(LEAFWIDTH);
			case 7:
				tree[6] = new Array(LEAFWIDTH);
			case 6:
				tree[5] = new Array(LEAFWIDTH);
			case 5:
				tree[4] = new Array(LEAFWIDTH);
			case 4:
				tree[3] = new Array(LEAFWIDTH);
			case 3:
				tree[2] = new Array(LEAFWIDTH);
			case 2:
				tree[1] = new Array(LEAFWIDTH);
			case 1:
			case 0:
				tree[0] = new Array(LEAFWIDTH);
				break;
			default:
				// technically, we should never reach here as we expect 32 max length
				// but might as well make the data structure complete...
				for (var i = 0; len > i; i++) {
					tree[i] = new Array(LEAFWIDTH);
				}
		}
		return tree;
	}

	function Block(length, tree) {

		this.length = length;
		this.tree = tree;
	}

	Block.of = function of(iterable) {
		var tree = new Array(ROOTWIDTH),
			i = 0;

		for (var item of iterable) {
			if (i & LEAFBIT === 0)
				tree.push(new Array(LEAFWIDTH));

			tree[i >> ROOTBIT][i & LEAFBIT] = item;
			i++;
		}

		return new Block(i, tree);
	}

	Block.empty = function(len = 0) {
		return new Block(len, emptyTree(len));
	}

	Block.one = function(value) {
		var tree = emptyTree(0)
		tree[0][0] = value;
		return new Block(0, tree);
	}

	Block.times = function times(fn, len) {
		var tree = emptyTree(len),
			leaf;

		var n = 0;
		for (var i = 0; len > i; i++) {
			n = i & LEAFBIT;

			if (n === 0)
				leaf = tree[i >> ROOTBIT];

			leaf[n] = fn(i);
		}

		return new Block(len, tree);
	}

	Object.assign(Block.prototype, {
		nth(i) {
			return this.tree[i >> ROOTBIT][i & LEAFBIT];
		},

		appendAll(iterable) {
			var tree = this.tree.slice(0),
				i = 0;

			for (var item of iterable) {
				if (i & LEAFBIT === 0)
					tree.push(new Array(LEAFWIDTH));

				tree[i >> ROOTBIT][i & LEAFBIT] = item;
				i++;
			}

			return new Block(i, tree);
		},

		append(value) {
			var newTree = this.tree.slice(0);
			var len = this.length + 1;
			var n = len >> ROOTBIT;

			// if full, start a new array
			var leaf = (len & LEAFBIT === 0) ?
							[value] : setǃ(len & LEAFBIT, value, (newTree[n] || []).slice(0));

			return new Block(len, setǃ(n, leaf, newTree));
		},

		prepend(value) {
			// we can optimize this by adding a startIndex/offset property
			var src = this.tree;
			var len = this.length + 1;
			var tree = emptyTree(len);

			for (var i = 1, n = 0; len > i; i++, n++) {
				// optimize current leaf;
				tree[i >> ROOTBIT][i & LEAFBIT] = src[n >> ROOTBIT][n & LEAFBIT];
			}
			tree[0][0] = value;
			return new Block(len, tree);
		},

		// immutable update
		update(i, value) {
			var newTree = this.tree.slice(0);
			var n = i >> ROOTBIT;
			var leaf = newTree[n] || []
			return new Block(this.length, setǃ(n, setǃ(i & LEAFBIT, value, leaf.slice(0)), newTree));
		},

		// mutate in place update
		updateǃ(i, value) {
			this.tree[i >> ROOTBIT][i & LEAFBIT] = value;
		},

		// since this graph is meant for performance, we're not going to validate inputs or handle negatives
		slice(start, end) {
			var len = end - start;
			if ((start & LEAFBIT) === 0) {
				// we can copy whole blocks
			}
			// random number, just copy everything
			var src = this.tree;
			var tree = emptyTree(len);
			for (var i = 0, n = start; len > i; i++, n++) {
				//todo: optimize for current leaf
				tree[i >> ROOTBIT][i & LEAFBIT] = src[n >> ROOTBIT][n & LEAFBIT];
			}
			return new Block8(len, tree);
		},

		reduceKV(fn, init) {
			var tree = this.tree,
				leaf;

			var n = 0;
			for (var i = 0, l = this.length; l > i; i++) {
				n = i & LEAFBIT;
				if (n === 0)
					leaf = tree[i >> ROOTBIT];

				init = fn(leaf[n], i, init);
			}

			return init
		}
	});

	return Block;

}

const Block4 = BlockFactory(4);
const Block8 = BlockFactory(8);
const Block16 = BlockFactory(16);

export {
	Block16,
	Block8,
	Block4,
	BlockFactory
}