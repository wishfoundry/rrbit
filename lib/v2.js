'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*
 * notes:
 *
 * # Node types
 * there are 3 node types
 *  - leaf nodes, containing concrete values. never > 32 length
 *  - balanced nodes are full parents, they are identified by the last item being null
 *  - unbalanced nodes are partially full parents
 *    for efficiency, unbalanced nodes have metadata on the sizes of it's children
 *    the last item in these arrays is the "sizes" array(unlike the paper, where it's the first)
 *    the sizes array has the same length as the number of children
 *
 * since it is possible to represent trees that are not filled on the left(using sizes ?)
 * the "startIndex" offset is removed, endIndex however is still used
 *
 */






/**
 *
 *
 *
 * @param endIndex
 * @param depth
 * @param display
 * @constructor
 */
function Node(endIndex) {
	// this.length = endIndex;
	this.endIndex = endIndex;
}

Node.prototype.empty = empty;

//todo rename endIndex to length
Object.defineProperty(Node.prototype, 'length', {
	get: function() {
		return this.endIndex
	},
	set: function(value) {
		this.endIndex = value;
	}
});

function withLength(len) {
	return new Node(len);
}

function empty() {
	var list = withLength(0);
	list.focus = 0;
	list.focusStart = 0;
	list.focusEnd = 0;
	list.focusDepth = 1;
	list.focusRelax = 0;
	list.display0 = [];
	list.display1 = null;
	list.display2 = null;
	list.display3 = null;
	list.display4 = null;
	list.display5 = null;
	//*/
	list.depth = 1;
	return list;
}


function fromFocusOf(src) {
	var list = withLength(src.endIndex);
	list.focusStart = src.focusStart;
	list.focusDepth = src.focusDepth;
	list.focusRelax = src.focusRelax;
	list.focusEnd = src.focusEnd;
	list.focus = src.focus;
	list.depth = src.depth;

	// there's a small hack used here with endIndex, where we mutate a shared display
	list.display0 = src.display0;
	list.display1 = src.display1;
	list.display2 = src.display2;
	list.display3 = src.display3;
	list.display4 = src.display4;
	list.display5 = src.display5;

	return list;
}

const emptyTransientBlock = new Array(2);

/**
 *
 * @param src
 * @param srcPos
 * @param dest
 * @param destPos
 * @param length
 */
function arraycopy(src, srcPos, dest, destPos, length) {
	var i = 0;
	while (i < length) {
		dest[i+destPos] = src[i+srcPos];
		i += 1;
	}
	return dest;
}

// Java-like System.arraycopy
// we can remove this for the more performing one above once we're certain we've no weird
// usages with negative indices


// slice and leave on extra space at the front

// slice and leave one extra space at the end




function aSet(i, val, array) {
	var copy = array.slice(0);
	copy[i] = val;
	return copy;
}

/*
 * we frequently want to clone an array, but off by one to either
 * safely append to the end or the beginning. doing this in one operation
 * instead of slice() and unshift() is much more efficient
 */




// safe & performant prepend  to end(returns new array


function last(arr) {
	return arr[arr.length - 1];
}

// int arrays do not allow nulls(that is to say null is always 0)
function makeIntArray(length) {
	var ints = new Array(length);
	for (var i = 0; length > i; i++) {
		ints[i] = 0;
	}
	return ints;
}
// int arrays must not return null

function normalize(_depth, rrb) {
	var currentLevel = rrb.focusDepth;
	var stabilizationIndex = rrb.focus | rrb.focusRelax;
	copyDisplaysAndStabilizeDisplayPath(currentLevel, stabilizationIndex, rrb);

	// todo: convert loop to switch
	if (currentLevel < _depth) {
		var display = rrb['display' + currentLevel];
		do {
			var newDisplay = display.slice(0);
			var idx = (stabilizationIndex >> (5 * currentLevel)) & 31;
			switch (currentLevel) {
				case 1 :
					newDisplay[idx] = rrb.display0;
					rrb.display1 = withRecomputeSizes(newDisplay, 2, idx);
					display = rrb.display2;
					break;
				case 2 :
					newDisplay[idx] = rrb.display1;
					rrb.display2 = withRecomputeSizes(newDisplay, 3, idx);
					display = rrb.display3;
					break;
				case 3 :
					newDisplay[idx] = rrb.display2;
					rrb.display3 = withRecomputeSizes(newDisplay, 4, idx);
					display = rrb.display4;
					break;
				case 4 :
					newDisplay[idx] = rrb.display3;
					rrb.display4 = withRecomputeSizes(newDisplay, 5, idx);
					display = rrb.display5;
					break;
				case 5 :
					newDisplay[idx] = rrb.display4;
					rrb.display5 = withRecomputeSizes(newDisplay, 6, idx);
					break;
			}
			currentLevel += 1;
		} while (currentLevel < _depth)
	}
}


function copyDisplaysAndStabilizeDisplayPath(depth, focus, rrb) {
	switch (depth) {
		case 1 :
			return rrb;
		case 2 :
			rrb.display1 = rrb.display1.slice(0);
			rrb.display1[(focus >> 5) & 31] = rrb.display0;
			return rrb;
		case 3 :
			rrb.display1 = rrb.display1.slice(0);
			rrb.display1[(focus >> 5) & 31] = rrb.display0;
			rrb.display2 = rrb.display2.slice(0);
			rrb.display2[(focus >> 10) & 31] = rrb.display1;
			return rrb;
		case 4 :
			rrb.display1 = rrb.display1.slice(0);
			rrb.display1[(focus >> 5) & 31] = rrb.display0;
			rrb.display2 = rrb.display2.slice(0);
			rrb.display2[(focus >> 10) & 31] = rrb.display1;
			rrb.display3 = rrb.display3.slice(0);
			rrb.display3[(focus >> 15) & 31] = rrb.display2;
			return rrb;
		case 5 :
			rrb.display1 = rrb.display1.slice(0);
			rrb.display1[(focus >> 5) & 31] = rrb.display0;
			rrb.display2 = rrb.display2.slice(0);
			rrb.display2[(focus >> 10) & 31] = rrb.display1;
			rrb.display3 = rrb.display3.slice(0);
			rrb.display3[(focus >> 15) & 31] = rrb.display2;
			rrb.display4 = rrb.display4.slice(0);
			rrb.display4[(focus >> 20) & 31] = rrb.display3;
			return rrb;
		case 6 :
			rrb.display1 = rrb.display1.slice(0);
			rrb.display1[(focus >> 5) & 31] = rrb.display0;
			rrb.display2 = rrb.display2.slice(0);
			rrb.display2[(focus >> 10) & 31] = rrb.display1;
			rrb.display3 = rrb.display3.slice(0);
			rrb.display3[(focus >> 15) & 31] = rrb.display2;
			rrb.display4 = rrb.display4.slice(0);
			rrb.display4[(focus >> 20) & 31] = rrb.display3;
			rrb.display5 = rrb.display5.slice(0);
			rrb.display5[(focus >> 25) & 31] = rrb.display4;
			return rrb;
	}
}

function copyDisplays(depth, focus, list) {
	if (depth < 2) return;

	// var idx1 = ((focus >> 5) & 31) + 1
	// list.display1 = copyOf(list.display1, idx1, idx1 + 1) //list.display1.slice(0, ((focus >> 5) & 31) + 1) ???
	list.display1 = list.display1.slice(0, ((focus >> 5) & 31) + 1);
	if (depth < 3) return;

	list.display2 = list.display2.slice(0, ((focus >> 10) & 31) + 1);
	if (depth < 4) return;

	list.display3 = list.display3.slice(0, ((focus >> 10) & 31) + 1);
	if (depth < 5) return;

	list.display4 = list.display4.slice(0, ((focus >> 10) & 31) + 1);
	if (depth < 6) return;

	list.display5 = list.display5.slice(0, ((focus >> 25) & 31) + 1);
}

function makeTransientIfNeeded(list) {
	if (list.depth > 1 && !list.transient) {
		copyDisplaysAndNullFocusedBranch(list.depth, list.focus | list.focusRelax, list);

		list.transient = true;
	}
}

function withRecomputeSizes(node, currentDepth, branchToUpdate) {

	var end = node.length - 1;
	var oldSizes = node[end];
	if (oldSizes != null) {
		// var newSizes = new Array(end);
		var newSizes = makeIntArray(end);

		var delta = treeSize(node[branchToUpdate] || [], currentDepth - 1);

		if (branchToUpdate > 0)
			arraycopy(oldSizes, 0, newSizes, 0, branchToUpdate);
		var i = branchToUpdate;
		while (i < end) {
			newSizes[i] = (oldSizes[i] || 0) + delta;
			// newSizes[i] = oldSizes[i] + delta;
			i += 1;
		}
		if (notBalanced(node, newSizes, currentDepth, end)) {
			node[end] = newSizes;
			// if (end > 6)
			// 	throw new Error([branchToUpdate, end, delta,  JSON.stringify(newSizes), JSON.stringify(oldSizes)].join(' : '))
		}
	}
	return node;
}

function notBalanced(node, sizes, currentDepth, end) {
	if (end == 1 ||
		sizes[end - 2] != ((end - 1) << (5 * (currentDepth - 1))))
		return true;

	var last$$1 = node[end - 1];
	return !!(currentDepth > 2 && last$$1[last$$1.length - 1] != null);

}

function treeSize(node, currentDepth) {
	return treeSizeRecur(node, currentDepth, 0);
}
// since depth is never more than 7, recursion is safe and still fast
function treeSizeRecur(node, currentDepth, acc) {

		if (currentDepth == 1) {
			//TODO: major HACK! does not belong
			// need to purge all cases where node is null
			// if (!node)
			// 	return acc + 32;

			return acc + node.length
		}
		var sizes = node[node.length - 1];
		if (sizes != null)
			return acc + sizes[sizes.length - 1];

		var len = node.length;
		return treeSizeRecur(node[len - 2], currentDepth - 1, acc + (len - 2) * (1 << (5 * (currentDepth - 1))))

}

function getIndexInSizes(sizes, indexInSubTree) {
	if (indexInSubTree == 0) return 0;
	var is = 0;
	while (sizes[is] <= indexInSubTree)
		is += 1;
	return is;
}

function focusOnLastBlockǃ(_endIndex, list) {
	// vector focus is not focused block of the last element
	if (((list.focusStart + list.focus) ^ (_endIndex - 1)) >= 32) {
		return normalizeAndFocusOnǃ(_endIndex - 1, list);
	}
	return list;
}

function focusOnFirstBlockǃ(list) {
	// the current focused block is not on the left most leaf block of the vector
	if (list.focusStart != 0 || (list.focus & -32) != 0) {
		return normalizeAndFocusOnǃ(0, list);
	}
	return list;
}

function normalizeAndFocusOnǃ(index, rrb) {
	if (rrb.transient) {
		normalize(rrb.depth, rrb);
		rrb.transient = false;
	}
	return focusOnǃ(index, rrb);
}

function focusOnǃ(index, rrb) {
	var {focusStart, focusEnd, focus} = rrb;

	if (focusStart <= index && index < focusEnd) {
		var indexInFocus = index - focusStart;
		var xor = indexInFocus ^ focus;
		if (xor >= 32)
			gotoPos(indexInFocus, xor, rrb);
		rrb.focus = indexInFocus;
	} else {
		gotoPosFromRoot(index, rrb);
	}
	return rrb;
}

//move displays to index, using simple/direct index lookup
function gotoPos(index, xor, rrb) {
	if (xor < 32) return;
	if (xor < 1024) {
		rrb.display0 = rrb.display1[(index >> 5) & 31];
	} else if (xor < 32768) {
		var d1 = rrb.display2[(index >> 10) & 31];
		rrb.display1 = d1;
		rrb.display0 = d1[(index >> 5) & 31];
	} else if (xor < 1048576) {
		var d2 = rrb.display3[(index >> 15) & 31];
		var d1 = d2[(index >> 10) & 31];
		rrb.display2 = d2;
		rrb.display1 = d1;
		rrb.display0 = d1[(index >> 5) & 31];
	} else if (xor < 33554432) {
		var d3 = rrb.display4[(index >> 20) & 31];
		var d2 = d3[(index >> 15) & 31];
		var d1 = d2[(index >> 10) & 31];
		rrb.display3 = d3;
		rrb.display2 = d2;
		rrb.display1 = d1;
		rrb.display0 = d1[(index >> 5) & 31];
	} else if (xor < 1073741824) {
		var d4 = rrb.display5[(index >> 25) & 31];
		var d3 = d4[(index >> 20) & 31];
		var d2 = d3[(index >> 15) & 31];
		var d1 = d2[(index >> 10) & 31];
		rrb.display4 = d4;
		rrb.display3 = d3;
		rrb.display2 = d2;
		rrb.display1 = d1;
		rrb.display0 = d1[(index >> 5) & 31];
	}
}

//move displays to index, using relaxed index lookup
function gotoPosFromRoot(index, rrb) {
	var {endIndex, depth} = rrb;
	var _startIndex = 0;
	var _focusRelax = 0;

	if (depth > 1) {
		var display = rrb['display' + (depth - 1)];
		do {
			var sizes = display[display.length - 1];
			if (sizes == null) {
				break;
			}
			var is = getIndexInSizes(sizes, index - _startIndex);
			display = display[is];
			if (depth == 2) {
				rrb.display0 = display;
				break;
			} else if (depth == 3) {
				rrb.display1 = display;
			} else if (depth == 4) {
				rrb.display2 = display;
			} else if (depth == 5) {
				rrb.display3 = display;
			} else if (depth == 6) {
				rrb.display4 = display;
			}
			if (is < sizes.length - 1)
				endIndex = _startIndex + sizes[is];

			if (is != 0)
				_startIndex += sizes[is - 1];

			depth -= 1;
			_focusRelax |= is << (5 * depth);
		} while (sizes != null)
	}

	var indexInFocus = index - _startIndex;
	gotoPos(indexInFocus, 1 << (5 * (depth - 1)), rrb);

	rrb.focus = indexInFocus;
	rrb.focusStart = _startIndex;
	rrb.focusEnd = endIndex;
	rrb.focusDepth = depth;
	rrb.focusRelax = _focusRelax;
}



function copyDisplaysAndNullFocusedBranch(depth, focus, list) {

	switch (depth) {
		case 2 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31);
			return
		case 3 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31);
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31);
			return
		case 4 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31);
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31);
			list.display3 = copyOfAndNull(list.display3, (focus >> 15) & 31);
			return
		case 5 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31);
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31);
			list.display3 = copyOfAndNull(list.display3, (focus >> 15) & 31);
			list.display4 = copyOfAndNull(list.display4, (focus >> 20) & 31);
			return
		case 6 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31);
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31);
			list.display3 = copyOfAndNull(list.display3, (focus >> 15) & 31);
			list.display4 = copyOfAndNull(list.display4, (focus >> 20) & 31);
			list.display5 = copyOfAndNull(list.display5, (focus >> 25) & 31);
			return
	}
}


function copyOfAndNull(array, nullIndex) {
	var len = array.length;
	var newArray = array.slice(0);
	newArray[nullIndex] = null;
	var sizes = array[len - 1];
	if (sizes != null) {
		newArray[len - 1] = makeTransientSizes(sizes, nullIndex);
	}
	return newArray;
}

function makeTransientSizes(oldSizes, transientBranchIndex) {
	var newSizes = makeIntArray(oldSizes.length);
	var delta = oldSizes[transientBranchIndex];
	var i = transientBranchIndex;

	if (transientBranchIndex > 0) {
		delta -= oldSizes[transientBranchIndex - 1];
		for (var n = 0; transientBranchIndex > n; n++) {
			newSizes[n] = oldSizes[n];
		}
	}

	var len = newSizes.length;
	while (i < len) {
		newSizes[i] = (oldSizes[i] || 0) - delta;
		i += 1;
	}
	return newSizes;
}

// create a new block at tail
function setupNewBlockInNextBranch(xor, transient, list) {
	var _depth = xor < 1024 ? 1 :
					(xor < 32768 ? 2 :
						(xor < 1048576 ? 3 :
							(xor < 33554432 ? 4 :
								(xor < 1073741824 ?  5 : 6))));


	if (list.transient && _depth !== 1)
		normalize(_depth, list);

	if (list.depth == _depth) {
		list.depth = _depth + 1;
		if (_depth === 1) {
			list.display1 = [list.display0, null, null];
		} else {
			list['display' + _depth] = makeNewRoot0(list['display' + (_depth - 1)]);
		}
	} else {
		var newRoot = copyAndIncRightRoot(list['display' + _depth], list.transient, _depth);
		if (list.transient) {
			var transientBranch = newRoot.length - 3;
			newRoot[transientBranch] = list['display' + (_depth - 1)];
			withRecomputeSizes(newRoot, _depth + 1, transientBranch);
			list['display' + _depth] = newRoot;
		}
	}
	switch(_depth) {
		case 5:
			list.display4 = emptyTransientBlock;
		case 4:
			list.display3 = emptyTransientBlock;
		case 3:
			list.display2 = emptyTransientBlock;
		case 2:
			list.display1 = emptyTransientBlock;
		case 1:
			list.display0 = new Array(1);
	}
}

// create a new block before head
function setupNewBlockInInitBranch(_depth, transient, list) {

	if (list.transient && _depth !== 2)
		normalize(_depth - 1, list);

	if (list.depth === (_depth - 1)) {
		list.depth = _depth;
		// if (_depth == 2) {
		// 	// console.warn('d2: ', JSON.stringify(list.display0))
		// 	list.display1 = [null, list.display0, [0, list.display0.length]]
		// } else {
		// 	list['display' + (_depth - 1)] = [
		// 		null,
		// 		list['display' + (_depth - 2)],
		// 		[0, treeSize(list['display' + (_depth - 2)], _depth - 1)]]
		// 	// list['display' + (_depth - 1)] = makeNewRoot1(list['display' + (_depth - 2)], _depth)
		// }
		var delta = _depth == 2 ? list.display0.length : treeSize(list['display' + (_depth - 2)], _depth - 1);
		list['display' + (_depth - 1)] = [null, list['display' + (_depth - 2)], [0, delta]];
	} else {
		// [null, list.display_...] from above should get un-nulled ?
		var newRoot = copyAndIncLeftRoot(list['display' + (_depth - 1)], list.transient, _depth - 1);

		if (list.transient) {
			console.log('PreWithRecom', _depth, newRoot.length, JSON.stringify(newRoot.slice(0, 1)));
			// newRoot[0] is always null here
			// but why is newRoot[1] supposedly null?
			withRecomputeSizes(newRoot, _depth, 1);
			console.log('not made it');
			newRoot[1] = list['display' + (_depth - 2)];
		}
		list['display' + (_depth - 1)] = newRoot;
	}

	switch(_depth) {
		case 6:
			list.display4 = emptyTransientBlock;
		case 5:
			list.display3 = emptyTransientBlock;
		case 4:
			list.display2 = emptyTransientBlock;
		case 3:
			list.display1 = emptyTransientBlock;
		case 2:
			list.display0 = new Array(1);
	}
}




// ====================================================================

// add extra rrb sizes to the node
function withComputedSizes(node, currentDepth) {
	var i = 0;
	var acc = 0;
	var end = node.length - 1;
	if (end > 1) {
		var sizes = new Array(end);
		while (i < end) {
			acc += treeSize(node[i], currentDepth - 1);
			sizes[i] = acc;
			i += 1;
		}
		if (notBalanced(node, sizes, currentDepth, end))
			node[end] = sizes;

	} else if (end == 1 && currentDepth > 2) {

		var childSizes = last(node[0]);
		if (childSizes != null) {
			node[end] = childSizes.length != 1 ? [childSizes[childSizes.length - 1]] : childSizes;
		}
	}
	return node;
}

function withComputedSizes1(node) {
	var i = 0;
	var acc = 0;
	var end = node.length - 1;
	if (end > 1) {
		var sizes = new Array(end);
		while (i < end) {
			acc += node[i].length;
			sizes[i] = acc;
			i += 1;
		}
		/* if node is not balanced */
		if (sizes(end - 2) != ((end - 1) << 5))
			node[end] = sizes;
	}
	return node;
}

function makeNewRoot0(node/* Array<T>*/) {
	var dLen = node.length;
	var dSizes = node[dLen - 1];
	var sizes = null;
	if (dSizes != null) {
		var dSize = dSizes[dLen - 2] || 0;
		sizes = [dSize, dSize];
	}
	return [node, null, sizes];
}




function copyAndIncRightRoot(node, transient, currentLevel) {
	var len = node.length;
	var newRoot = new Array(len + 1);
	arraycopy(node, 0, newRoot, 0, len - 1);
	var oldSizes = node[len - 1];
	if (oldSizes != null) {
		var newSizes = makeIntArray(len);
		arraycopy(oldSizes, 0, newSizes, 0, len - 1);

		if (transient) {
			newSizes[len - 1] = 1 << (5 * currentLevel);
		}

		newSizes[len - 1] = newSizes[len - 2] || 0;
		newRoot[len] = newSizes;
	}
	return newRoot
}

function copyAndIncLeftRoot(node, transient, currentLevel) {
	// throw new Error("incleft node", JSON.stringify(node))
	console.warn('incleft');
	var len = node.length;
	var newRoot = new Array(len + 1);
	arraycopy(node, 0, newRoot, 1, len - 1);

	var oldSizes = node[len - 1];
	var newSizes = makeIntArray(len);
	if (oldSizes != null) {
		if (transient) {
			arraycopy(oldSizes, 1, newSizes, 2, len - 2);
		} else {
			arraycopy(oldSizes, 0, newSizes, 1, len - 1);
		}
	} else {
		var subTreeSize = 1 << (5 * currentLevel);
		var acc = 0;
		var i = 1;
		while (i < len - 1) {
			acc += subTreeSize;
			newSizes[i] = acc;
			i += 1;
		}
		newSizes[i] = acc + treeSize(node[node.length - 2], currentLevel);
	}
	newRoot[len] = newSizes;
	// console.log('is returning:', JSON.stringify(newRoot))
	return newRoot
}

function stabilizeDisplayPath(depth, focus, list) {
	switch (depth) {
		case 1:
		   return;

		case 2 :
		   list.display1[(focus>>5) & 31] = list.display0;
		   return;

		case 3 :
		   list.display2[(focus >> 10) & 31] = list.display1;
		   list.display1[(focus >> 5 ) & 31] = list.display0;
		   return;

		case 4 :
		   list.display3[(focus >> 15) & 31] = list.display2;
		   list.display2[(focus >> 10) & 31] = list.display1;
		   list.display1[(focus >> 5 ) & 31] = list.display0;
		   return;

		case 5 :
		   list.display4[(focus >> 20) & 31] = list.display3;
		   list.display3[(focus >> 15) & 31] = list.display2;
		   list.display2[(focus >> 10) & 31] = list.display1;
		   list.display1[(focus >> 5 ) & 31] = list.display0;
		   return;

		case 6 :
		   list.display5[(focus >> 25) & 31] = list.display4;
		   list.display4[(focus >> 20) & 31] = list.display3;
		   list.display3[(focus >> 15) & 31] = list.display2;
		   list.display2[(focus >> 10) & 31] = list.display1;
		   list.display1[(focus >> 5 ) & 31] = list.display0;
		   return
	}
}

function computeBranching(displayLeft, concat, displayRight, currentDepth) {
	var leftLength = (displayLeft == null) ? 0 : displayLeft.length - 1;
	var concatLength = (concat == null) ? 0 : concat.length - 1;
	var rightLength = (displayRight == null) ? 0 : displayRight.length - 1;
	var branching = 0;
	if (currentDepth == 1) {
		branching = leftLength + concatLength + rightLength;
		if (leftLength != 0)
			branching -= 1;
		if (rightLength != 0)
			branching -= 1;
	} else {
		var i = 0;
		while (i < leftLength - 1) {
			branching += displayLeft[i].length;
			i += 1;
		}
		i = 0;
		while (i < concatLength) {
			branching += concat[i].length;
			i += 1;
		}
		i = 1;
		while (i < rightLength) {
			branching += displayRight[i].length;
			i += 1;
		}
		if (currentDepth != 2) {
			branching -= leftLength + concatLength + rightLength;
			if (leftLength != 0)
				branching += 1;
			if (rightLength != 0)
				branching += 1;
		}

	}
	return branching;
}

/**
 * append one value to end of list, returning a new list
 *
 * @param {T} value
 * @param {Node<T>} list
 * @return {Node<T>}
 */
function append(value, list) {
	if (list.endIndex === 0) {
		var vec = empty();
		vec.endIndex = 1;
		vec.focusEnd = 1;
		vec.display0 = [value];
		return vec;
	}

	var x = fromFocusOf(list);
	x.transient = list.transient;
	x.endIndex = list.endIndex + 1;



	focusOnLastBlockǃ(list.endIndex, x);

	var elemIndexInBlock = (list.endIndex - x.focusStart) & 31;
	if  (elemIndexInBlock === 0) {
		// next element will go in a new block position
		appendBackNewBlock(value, list.endIndex, x);
	} else {
		// if next element will go in current block position
		appendOnCurrentBlock(value, elemIndexInBlock, x);
	}


	return x;
}

/**
 * mutable append
 *
 * a more performant version meant for use in builders or private loops
 *
 * @param value
 * @param list
 * @return {*}
 */
function appendǃ(value, list) {
	if (list.endIndex === 0) {
		list.endIndex = 1;
		list.display0 = [value];
		return list;
	}

	// var list = fromFocusOf(list);
	// list.endIndex = list.endIndex;
	// list.transient = list.transient;
	list.endIndex += 1;

	focusOnLastBlockǃ(list.endIndex, list);

	var elemIndexInBlock = (list.endIndex - list.focusStart) & 31;
	if  (elemIndexInBlock === 0) {
		// next element will go in a new block position
		appendBackNewBlock(value, list.endIndex, list);
	} else {
		// if next element will go in current focused block
		list.focusEnd = list.endIndex;
		list.display0[elemIndexInBlock] = value;
		makeTransientIfNeeded(list);
	}

	return list;
}


function appendOnCurrentBlock(value, elemIndexInBlock, list) {

	list.focusEnd = list.endIndex;
	var d0 = list.display0.slice(0);
	d0[elemIndexInBlock] = value;
	// d0.push(value)
	list.display0 = d0;
	makeTransientIfNeeded(list);
}

function appendBackNewBlock(elem, _endIndex, list) {
	var oldDepth = list.depth;
	var newRelaxedIndex = _endIndex - list.focusStart + list.focusRelax;
	var focusJoined = list.focus | list.focusRelax;
	var xor = newRelaxedIndex ^ focusJoined;

	setupNewBlockInNextBranch(xor, list.transient, list);

	// setupNewBlockInNextBranch(...) increased the depth of the tree
	if (oldDepth == list.depth) {
		var i = xor < 1024 ? 2 :
				(xor < 32768 ? 3 :
					(xor < 1048576 ? 4 :
						(xor < 33554432 ? 5 :
							6)));

		if (i < oldDepth) {
			var _focusDepth = list.focusDepth;
			var display = list['display' + i];
			do {
				var displayLen = display.length - 1;
				var oldSizes = display[displayLen];
				var newSizes = (i >= _focusDepth && oldSizes != null) ?
					makeTransientSizes(oldSizes, displayLen - 1)
					: null;

				var newDisplay = new Array(display.length);
				arraycopy(display, 0, newDisplay, 0, displayLen - 1);
				if (i >= _focusDepth)
					newDisplay[displayLen] = newSizes;

				switch (i) {
					case 2 :
						list.display2 = newDisplay;
						display = list.display3;
						break;
					case 3 :
						list.display3 = newDisplay;
						display = list.display4;
						break;
					case 4 :
						list.display4 = newDisplay;
						display = list.display5;
						break;
					case 5 :
						list.display5 = newDisplay;
				}
				i += 1;
			} while (i < oldDepth)
		}
	}

	if (oldDepth == list.focusDepth) {
		list.focus = _endIndex;
		list.focusStart = 0;
		list.focusDepth = list.depth;
		list.focusRelax = 0;

	} else {
		list.focus = 0;
		list.focusStart = _endIndex;
		list.focusDepth = 1;
		list.focusRelax = newRelaxedIndex & -32;
	}
	list.focusEnd = _endIndex + 1;
	list.display0[0] = elem;
	list.transient = true;
}

/**
 * a public 'get' method
 *
 * @param {number} index
 * @param {Node<T>} list - the list, sequence/iterator or pointer to lookup on
 * @param  notFound - value to yield if index is out of bounds. useful for wrapping
 *                    your platform's preferred error handling scheme
 * @return {T|notFound}
 */
function nth(index, list, notFound) {
	var {focusStart, focusEnd, focus, endIndex} = list;

	if (index < 0)
		index += endIndex;

	if  (index < 0 || endIndex < index) { // index is in the vector bounds
		return notFound
	}

	// index is in focused subtree
	if  (focusStart <= index && index < focusEnd) {
		var indexInFocus = index - focusStart;
		return getElemInFocus(indexInFocus, indexInFocus ^ focus, list, notFound);
	}

	if (list.transient) {
		normalize(list.depth, list);
		list.transient = false;
	}
	return getElementFromRoot(index, list)
}

function getElemInFocus(index, xor, list, notFound) {

	if (xor < 32) return getElemD(1, index, list.display0);
	if (xor < 1024) return getElemD(2, index, list.display1);
	if (xor < 32768) return getElemD(3, index, list.display2);
	if (xor < 1048576) return getElemD(4, index, list.display3);
	if (xor < 33554432) return getElemD(5, index, list.display4);
	if (xor < 1073741824) return getElemD(6, index, list.display5);

	// ideally we should be throwing an error here as anything this high
	// is ALWAYS out of bounds. but v8 is much less performing when it detects an error case
	return notFound;
}



function getElementFromRoot(index, list) {
	var depth = list.depth;
	var display = list["display" + (depth - 1)];

	//when in relaxed mode, we may have to offset the index a little
	//to find the branch our value lives in
	var sizes = display[display.length - 1];
	do {
		var sizesIdx = getIndexInSizes(sizes, index);
		if (sizesIdx != 0)
			index -= sizes[sizesIdx - 1];
		display = display[sizesIdx];
		if (depth > 2)
			sizes = display[display.length - 1];
		else
			sizes = null;
		depth -= 1;
	} while (sizes != null);

	return getElemD(depth, index, display);
}

function getElemD(depth, i, display) {
	// switch(depth) {
	// 	case 6:
	// 		display = display[(i >> 25) & 31];
	// 	case 5:
	// 		display = display[(i >> 20) & 31];
	// 	case 4:
	// 		display = display[(i >> 15) & 31];
	// 	case 3:
	// 		display = display[(i >> 10) & 31];
	// 	case 2:
	// 		display = display[(i >> 5) & 31];
	// 	case 1:
	// 		return display[(i & 31)]
	// }

	switch(depth) {
		case 6:
			return display[(i >> 25) & 31][(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
		case 5:
			return display[(i >> 20) & 31][(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
		case 4:
			return display[(i >> 15) & 31][(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
		case 3:
			return display[(i >> 10) & 31][(i >> 5) & 31][(i & 31)];
		case 2:
			return display[(i >> 5) & 31][(i & 31)];
		case 1:
			return display[(i & 31)]
	}
}

//although not directly mentioned in the brief
// is seems that something for the concat operation is inevitable

/**
 * TODO: rename to differentiate operations for builders vs simple/collections
 * TODO: append all from generic iterable operation(for builders)
 * TODO: copy all from rrb operation(for builders, copy whole leaves in mass)
 *
 * This operation only accepts 2 vectors
 * a suitable builder should be used instead to append any other iterable
 *
 * there are 3 options to join vectors:
 * - if left is small, prepend left to right
 * - if right is small, prepend right to left
 * - else use a mutable builder to create a new vector
 *
 * @param {Node} left
 * @param {Node} right
 * @return {Node}
 */
function appendAll(left, right) {
	if (left.endIndex == 0) return right;
	if (right.endIndex == 0) return left;

	// do short/fast append
	if (1024 > left.endIndex && right.endIndex <= 32) {
		return appendLeafsǃ(left, right);
	}

	// do full concat
	var vec = fromFocusOf(left);
	vec.endIndex = left.endIndex;
	vec.transient = left.transient;
	return appendTreesǃ(vec, right);
}

/**
 *
 * @param {Node} left0
 * @param {Node} right
 */
function appendLeafsǃ(left0, right) {

	var _right = right.display0;
	var left = fromFocusOf(left0);
	left.transient = left0.transient;
	var newEndIndex = left.endIndex = left0.endIndex + right.endIndex;
	var currentEndIndex = left0.endIndex;

	focusOnLastBlockǃ(currentEndIndex, left);
	makeTransientIfNeeded(left);

	var i = 0;
	while (currentEndIndex < newEndIndex) {
		var elemIndexInBlock = (currentEndIndex - left.focusStart) & 31;

		/* if next element will go in current block position */
		if (elemIndexInBlock != 0) {
			var batchSize = Math.min(32 - elemIndexInBlock, _right.length - i);
			var d0 = new Array(elemIndexInBlock + batchSize);
			arraycopy(left.display0, 0, d0, 0, elemIndexInBlock);
			arraycopy(right.display0, i, d0, elemIndexInBlock, batchSize);
			left.display0 = d0;
			currentEndIndex += batchSize;
			left.focusEnd = currentEndIndex;
			i += batchSize;
		} else /* next element will go in a new block position */ {
			appendBackNewBlock(nth(i, right), currentEndIndex, left);
			currentEndIndex += 1;
			i += 1;
		}
	}

	return left;

}


function appendTreesǃ(left, that) {
	var d0 = null;
	var d1 = null;
	var d2 = null;
	var d3 = null;
	var d4 = null;
	var d5 = null;
	var concat;

	var currentSize = left.endIndex;
	left.endIndex = left.endIndex + that.endIndex;
	var thisDepth = left.depth;
	var thatDepth = that.depth;
	if (left.transient) {
		normalize(thisDepth, left);
		left.transient = false;
	}

	if (that.transient) {
		normalize(thatDepth, that);
		that.transient = false;
	}

	focusOnǃ(currentSize - 1, left);
	var maxDepth = Math.max(left.depth, that.depth);

	if (maxDepth === 1) {
		concat = rebalancedLeafs(left.display0, that.display0, true);
		return initFromRoot(concat, currentSize <= 32 ? 1 : 2, left);
	}

	// left should be focused on last leaf
	// but for right, we need the first leaf
	if (((that.focus | that.focusRelax) & -32) == 0) {
		d5 = that.display5;
		d4 = that.display4;
		d3 = that.display3;
		d2 = that.display2;
		d1 = that.display1;
		d0 = that.display0;
	} else {
		d5 = that.display5;
		d4 = d5 ? d5[0] : that.display4;
		d3 = d4 ? d4[0] : that.display3;
		d2 = d3 ? d3[0] : that.display2;
		d1 = d2 ? d2[0] : that.display1;
		d0 = d1 ? d1[0] : that.display0;
	}


	// depth 1 is already covered
	concat = rebalancedLeafs(left.display0, d0, false);
	concat = rebalanced(left.display1, concat, d1, 2);
	if (maxDepth >= 3)
		concat = rebalanced(left.display2, concat, d2, 3);
	if (maxDepth >= 4)
		concat = rebalanced(left.display3, concat, d3, 4);
	if (maxDepth >= 5)
		concat = rebalanced(left.display4, concat, d4, 5);
	if (maxDepth == 6)
		concat = rebalanced(left.display5, concat, d5, 6);

	if (concat.length == 2) {
		initFromRoot(concat[0], maxDepth, left);
	} else {
		initFromRoot(withComputedSizes(concat, maxDepth + 1), maxDepth + 1, left);
	}

	return left;
}



function rebalancedLeafs(displayLeft, displayRight, isTop) {
	var leftLength = displayLeft.length;
	var rightLength = displayRight.length;

	if (leftLength == 32) {
		return [displayLeft, displayRight, null];
	} else if (leftLength + rightLength <= 32) {
		var mergedDisplay = new Array(leftLength + rightLength);
		arraycopy(displayLeft, 0, mergedDisplay, 0, leftLength);
		arraycopy(displayRight, 0, mergedDisplay, leftLength, rightLength);

		return isTop ? mergedDisplay : [mergedDisplay, null];
	}

	var arr0 = new Array(32);
	var arr1 = new Array(leftLength + rightLength - 32);
	arraycopy(displayLeft, 0, arr0, 0, leftLength);
	arraycopy(displayRight, 0, arr0, leftLength, 32 - leftLength);
	arraycopy(displayRight, 32 - leftLength, arr1, 0, rightLength - 32 + leftLength);
	return [arr0, arr1, null];

}

function rebalanced(displayLeft, concat, displayRight, currentDepth) {
	var leftLength = (displayLeft == null) ? 0 : displayLeft.length - 1;
	var concatLength = (concat == null) ? 0 : concat.length - 1;
	var rightLength = (displayRight == null) ? 0 : displayRight.length - 1;
	var branching = computeBranching(displayLeft, concat, displayRight, currentDepth);
	var top = new Array((branching >> 10) + (((branching & 1023) == 0) ? 1 : 2));
	var mid = new Array(((branching >> 10) == 0) ? ((branching + 31) >> 5) + 1 : 33);
	var bot;
	var iSizes = 0;
	var iTop = 0;
	var iMid = 0;
	var iBot = 0;
	var i = 0;
	var j = 0;
	var d = 0;
	var currentDisplay;
	var displayEnd = 0;
	do {
		switch (d) {
			case 0 :
				if (displayLeft != null) {
					currentDisplay = displayLeft;
					displayEnd = (concat == null) ? leftLength : leftLength - 1;
				}
				break;
			case 1 :
				if (concat == null)
					displayEnd = 0;
				else {
					currentDisplay = concat;
					displayEnd = concatLength;
				}
				i = 0;
				break;
			case 2 :
				if (displayRight != null) {
					currentDisplay = displayRight;
					displayEnd = rightLength;
					i = (concat == null) ? 0 : 1;
				}
				break;
		}
		while (i < displayEnd) {
			var displayValue = currentDisplay[i];
			var displayValueEnd = (currentDepth == 2) ? displayValue.length : displayValue.length - 1;
			if ((iBot | j) == 0 && displayValueEnd == 32) { // the current block in displayValue can be used directly (no copies)
				if (currentDepth != 2 && bot != null) {
					withComputedSizes(bot, currentDepth - 1);
					bot = null;
				}
				mid[iMid] = displayValue;
				i += 1;
				iMid += 1;
				iSizes += 1;
			} else {
				var numElementsToCopy = Math.min(displayValueEnd - j, 32 - iBot);
				if (iBot == 0) {
					if (currentDepth != 2 && bot != null)
						withComputedSizes(bot, currentDepth - 1);
					var _min = (branching - (iTop << 10) - (iMid << 5), 32);
					var __len = Math.min(branching - (iTop << 10) - (iMid << 5), 32) + (currentDepth == 2 ? 0 : 1);
					if (__len !== 32) {
						'foo';
					} else {
						'foo';
					}
					bot = new Array(__len);
					mid[iMid] = bot;
				}

				arraycopy(displayValue, j, bot, iBot, numElementsToCopy);
				j += numElementsToCopy;
				iBot += numElementsToCopy;
				if (j == displayValueEnd) {
					i += 1;
					j = 0;
				}

				if (iBot == 32) {
					iMid += 1;
					iBot = 0;
					iSizes += 1;
					if (currentDepth != 2 && bot != null)
						withComputedSizes(bot, currentDepth - 1);
				}

			}
			if (iMid == 32) {
				top[iTop] = (currentDepth == 1) ? withComputedSizes1(mid) : withComputedSizes(mid, currentDepth);
				iTop += 1;
				iMid = 0;
				var remainingBranches = branching - ((iTop << 10) | (iMid << 5) | iBot);
				if (remainingBranches > 0)
					mid = new Array(((remainingBranches >> 10) == 0) ? (remainingBranches + 63) >> 5 : 33);
				else
					mid = null;
			}

		}
		d += 1;
	} while (d < 3);

	if (currentDepth != 2 && bot != null)
		withComputedSizes(bot, currentDepth - 1);

	if (mid != null)
		top[iTop] = (currentDepth == 1) ? withComputedSizes1(mid) : withComputedSizes(mid, currentDepth);

	return top
}

function initFromRoot(root, depth, rrb) {
	//if (depth !== 0) // shouldn't need this if
	rrb['display' + (depth - 1)] = root;

	rrb.depth = depth;
	rrb.focusEnd = rrb.focusStart;
	rrb['display' + (depth - 1)] = root;
	focusOnǃ(0, rrb);
	return rrb;
}

/**
 * @typedef Node
 * @property {number} endIndex
 * @property {number} depth
 * @property {Array} display0
 * @property {Array} display1
 * @property {Array} display2
 * @property {Array} display3
 * @property {Array} display4
 * @property {Array} display5
 * @property {boolean} transient
 * @property {number} focus
 * @property {number} focusStart
 * @property {number} focusEnd
 * @property {number} focusDepth
 * @property {number} focusRelax
 *
 */

/**
 * drop first n items keeping the tail
 *
 * @param {number} n
 * @param {Node} rrb
 * @return {Node}
 */
function drop(n, rrb) {
	if (n <= 0)
		return rrb;

	if (n >= rrb.endIndex)
		return empty() //todo: setup injector for this

	if (rrb.transient) {
		normalize(rrb.depth, rrb);
		rrb.transient = false;
	}

	var vec = fromFocusOf(rrb);
	vec.endIndex = rrb.endIndex - n;
	if (vec.depth > 1) {
		focusOnǃ(n, vec);
		var cutIndex = vec.focus | vec.focusRelax;
		var d0Start = cutIndex & 31;
		if (d0Start != 0) {
			var d0len = vec.display0.length - d0Start;
			vec.display0 = arraycopy(vec.display0, d0Start, new Array(d0len), 0, d0len);
		}

		cleanTopDrop(cutIndex, vec);
		if (vec.depth > 1) {
			var i = 2;
			var display = vec.display1;
			while (i <= vec.depth) {
				var splitStart = (cutIndex >> (5 * (i - 1))) & 31;
				var newLen = display.length - splitStart - 1;
				var newDisplay = arraycopy(display, splitStart + 1, new Array(newLen + 1), 1, newLen - 1);

				if (i > 1) {
					newDisplay[0] = vec['display' + (i - 2)];
					vec['display' + (i - 1)] = withComputedSizes(newDisplay, i);
					if (display < 6)
						display = vec['display' + i];
				}

				i += 1;
			}
		}

		vec.focusEnd = vec.display0.length;
	} else {
		var newLen = vec.display0.length - n;
		vec.focusEnd = newLen;
		vec.display0 = arraycopy(vec.display0, n, new Array(newLen), 0, newLen);
	}

	vec.focus = 0;
	vec.focusStart = 0;
	vec.focusDepth = 1;
	vec.focusRelax = 0;
	return vec
}


// adjust focus and depth to match new length
function  cleanTopDrop(cutIndex, rrb) {
	var newDepth = 0;

	var nulled = null;
	// var nulled = []; //in theory, null should work ¯\_(ツ)_/¯

	var {
		depth,
		//display0,
		display1,
		display2,
		display3,
		display4,
		display5 } = rrb;

	if (depth == 1)
		return;

	if (depth < 6 || (cutIndex >> 25) == display5.length - 2) {
		rrb.display5 = nulled;
		if (depth < 5 || (cutIndex >> 20) == display4.length - 2) {
			rrb.display4 = nulled;
			if (depth < 4 || (cutIndex >> 15) == display3.length - 2) {
				rrb.display3 = nulled;
				if (depth < 3 || (cutIndex >> 10) == display2.length - 2) {
					rrb.display2 = nulled;
					if ((cutIndex >> 5) == display1.length - 2) {
						rrb.display1 = nulled;
						newDepth = 1;
					} else
						newDepth = 2;
				} else
					newDepth = 3;
			} else
				newDepth = 4;
		} else
			newDepth = 5;
	} else
		newDepth = 6;

	rrb.depth = newDepth;
}

/**
 * @typedef Node
 * @property {number} endIndex
 * @property {number} depth
 * @property {Array} display0
 * @property {Array} display1
 * @property {Array} display2
 * @property {Array} display3
 * @property {Array} display4
 * @property {Array} display5
 * @property {boolean} transient
 * @property {number} focus
 * @property {number} focusStart
 * @property {number} focusEnd
 * @property {number} focusDepth
 * @property {number} focusRelax
 *
 */


/**
 * keep first n items dropping the tail
 *
 * @param {number} n
 * @param {Node<T>} rrb
 * @return {Node<T>}
 */
function take(n, rrb) {
	if (0 >= n) {
		return empty() //todo: setup injector for this
	}
	if (n >= rrb.endIndex) {
		return rrb;
	}

	// TODO: drop from transient leaf if n and focus are in the last leaf.
	// This would amortize takes that drop few elements like init

	if (rrb.transient) {
		normalize(depth, rrb);
		rrb.transient = false;
	}


	var vec = fromFocusOf(rrb);
	vec.endIndex = n;
	vec.focusEnd = n;

	if (rrb.depth > 1) {
		focusOnǃ(n - 1, vec);
		var d0len = (vec.focus & 31) + 1;
		if (d0len != 32) {
			vec.display0 = vec.display0.slice(0, d0len);
		}

		var cutIndex = vec.focus | vec.focusRelax;
		cleanTopTake(cutIndex, vec);
		vec.focusDepth = Math.min(vec.depth, vec.focusDepth);

		if (!(vec.depth > 1))
			return vec;

		copyDisplays(vec.focusDepth, cutIndex, vec);
		var i = vec.depth;
		var offset = 0;
		while (i > vec.focusDepth) {
			var display = vec['display' + (i + 1)];

			var oldSizes = display[display.length - 1];
			var newLen = ((vec.focusRelax >> (5 * (i - 1))) & 31) + 1;
			var newSizes = new Array(newLen);
			arraycopy(oldSizes, 0, newSizes, 0, newLen - 1);
			newSizes[newLen - 1] = n - offset;
			if (newLen > 1)
				offset += newSizes[newLen - 2];

			var newDisplay = new Array(newLen + 1);
			arraycopy(display, 0, newDisplay, 0, newLen);
			newDisplay[newLen - 1] = null;
			newDisplay[newLen] = newSizes;
			switch (i) {
				case 2 :
					vec.display1 = newDisplay;
				case 3 :
					vec.display2 = newDisplay;
				case 4 :
					vec.display3 = newDisplay;
				case 5 :
					vec.display4 = newDisplay;
				case 6 :
					vec.display5 = newDisplay;
			}
			i -= 1;
		}
		stabilizeDisplayPath(vec.depth, cutIndex, vec);


	} else if (/* depth==1 && */ n != 32) {
		var d0 = new Array(n);
		arraycopy(vec.display0, 0, d0, 0, n);
		vec.display0 = d0;
		vec.focus = 0;
		vec.focusStart = 0;
		vec.focusDepth = 1;
		vec.focusRelax = 0;
	}
	return vec
}


function cleanTopTake(cutIndex, rrb){
	var newDepth = 0;
	var nulled = null;
	// var nulled = []; //in theory, null should work ¯\_(ツ)_/¯

	var {depth} = rrb;
	if (depth == 1)
		return;

	if (depth < 6 || cutIndex < 33554432) {
		rrb.display5 = nulled;
		if (depth < 5 || cutIndex < 1048576) {
			rrb.display4 = nulled;
			if (depth < 4 || cutIndex < 32768) {
				rrb.display3 = nulled;
				if (depth < 3 || cutIndex < 1024) {
					rrb.display2 = nulled;
					if (cutIndex < 32) {
						rrb.display1 = nulled;
						newDepth = 1;
					} else
						newDepth = 2;
				} else
					newDepth = 3;
			} else
				newDepth = 4;
		} else
			newDepth = 5;
	} else
		newDepth = 6;

	rrb.depth = newDepth;
}

/**
 *
 * @param {number} i
 * @param {T} value
 * @param {Node<T>} rrb
 * @param {*} notFound
 * @return {Node<T>|notFound}
 */
function update(i, value, rrb, notFound) {
	var vec = fromFocusOf(rrb);
	vec.transient = rrb.transient;
	vec.endIndex = rrb.endIndex;

	if (i < rrb.focusStart || rrb.focusEnd <= i || ((i - rrb.focusStart) & ~31) != (rrb.focus & ~31)) {
		if (i < 0 || endIndex <= i)
			return notFound;

		normalizeAndFocusOnǃ(i, vec);
	}
	makeTransientIfNeeded(vec);
	vec.display0 = aSet((i - vec.focusStart) & 31, value, vec.display0);
	return vec;
}

/**
 *
 * @param {T} value
 * @param {Node<T>} rrb
 * @return {Node<T>}
 */
function prepend(value, list) {

	if (list.endIndex === 0) {
		var vec = empty();
		vec.endIndex = 1;
		vec.display0 = [value];
		return vec;
	}

	var x = fromFocusOf(list);
	x.endIndex = list.endIndex;
	x.transient = list.transient;
	x.endIndex = list.endIndex + 1;

	focusOnFirstBlockǃ(x);
	if (list.display0.length < 32) { // element fits in current block
		prependOnCurrentBlock(value, x);
	} else {
		prependFrontNewBlock(value, x);
	}

	return x
}


function prependOnCurrentBlock(value, list) {
	var oldD0 = list.display0;
	var newLen = oldD0.length + 1;
	list.focusEnd = newLen;

	var d0 = new Array(newLen);
	d0[0] = value;
	for (var i = 0, l = oldD0.length; l > i; i++) {
		d0[i + 1] = oldD0[i];
	}

	list.display0 = d0;
	makeTransientIfNeeded(list);
}


function prependFrontNewBlock(elem, list) {

var currentDepth = list.focusDepth;
	if (currentDepth == 1)
		currentDepth += 1;

	if (currentDepth == 1)
		currentDepth = 2;
	var display = list['display' + (currentDepth - 1)];

	while (display != null && display.length == 33) { /* the insertion depth has not been found */
		currentDepth += 1;
		switch (currentDepth) {
			case 2 : display = list.display1; break;
			case 3 : display = list.display2; break;
			case 4 : display = list.display3; break;
			case 5 : display = list.display4; break;
			case 6 : display = list.display5; break;
		}
	}

	var oldDepth = list.depth;

	// create new node at this depth and all singleton nodes under it on left most branch
	setupNewBlockInInitBranch(currentDepth, list.transient, list);

	// update sizes of nodes above the insertion depth
	if (oldDepth == list.depth) { // setupNewBlockInNextBranch(...) increased the depth of the tree
		var i = currentDepth;
		if (i < oldDepth) {
			var _focusDepth = list.focusDepth;
			display = list['display' + i];
			do {
				var displayLen = display.length - 1;
				var newSizes = i >= _focusDepth ? makeTransientSizes(display[displayLen], 1) : null;

				var newDisplay = new Array(display.length);
				arraycopy(display, 1, newDisplay, 1, displayLen - 1);
				if (i >= _focusDepth)
					newDisplay[displayLen] = newSizes;

				switch (i) {
					case 2:
						list.display2 = newDisplay;
						display = list.display3;
						break;
					case 3:
						list.display3 = newDisplay;
						display = list.display4;
						break;
					case 4:
						list.display4 = newDisplay;
						display = list.display5;
						break;
					case 5:
						list.display5 = newDisplay;
						break;
				}
				i += 1;
			} while (i < oldDepth)
		}
	}

	list.focus = 0;
	list.focusStart = 0;
	list.focusEnd = 1;
	list.focusDepth = 1;
	list.focusRelax = 0;
	list.display0[0] = elem;
	list.transient = true;
	return list;
}

//entry point for build tools(e.g. rollup)

exports.append = append;
exports.appendǃ = appendǃ;
exports.appendAll = appendAll;
exports.nth = nth;
exports.drop = drop;
exports.take = take;
exports.update = update;
exports.prepend = prepend;
exports.empty = empty;
