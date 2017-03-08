import {arraycopy, last, makeIntArray} from './_array';
import {emptyTransientBlock} from './_constructors';

export function normalize(_depth, rrb) {
	var currentLevel = rrb.focusDepth;
	var stabilizationIndex = rrb.focus | rrb.focusRelax;
	copyDisplaysAndStabilizeDisplayPath(currentLevel, stabilizationIndex, rrb);

	// todo: convert loop to switch
	if (currentLevel <= _depth) {
		var display = rrb['display' + currentLevel];
		do {
			var newDisplay = display.slice(0);
			var idx = (stabilizationIndex >> (5 * currentLevel)) & 31
			switch (currentLevel) {
				case 1 :
					newDisplay[idx] = rrb.display0;
					rrb.display1 = withRecomputeSizes(newDisplay, 2, idx)
					display = rrb.display2;
					break;
				case 2 :
					newDisplay[idx] = rrb.display1;
					rrb.display2 = withRecomputeSizes(newDisplay, 3, idx)
					display = rrb.display3;
					break;
				case 3 :
					newDisplay[idx] = rrb.display2;
					rrb.display3 = withRecomputeSizes(newDisplay, 4, idx)
					display = rrb.display4;
					break;
				case 4 :
					newDisplay[idx] = rrb.display3;
					rrb.display4 = withRecomputeSizes(newDisplay, 5, idx)
					display = rrb.display5;
					break;
				case 5 :
					newDisplay[idx] = rrb.display4;
					rrb.display5 = withRecomputeSizes(newDisplay, 6, idx)
					break;
			}
			currentLevel += 1
		} while (currentLevel < _depth)
	}
}


function copyDisplaysAndStabilizeDisplayPath(depth, focus, rrb) {
	switch (depth) {
		case 1 :
			return rrb;
		case 2 :
			rrb.display1 = rrb.display1.slice(0)
			rrb.display1[(focus >> 5) & 31] = rrb.display0
			return rrb;
		case 3 :
			rrb.display1 = rrb.display1.slice(0)
			rrb.display1[(focus >> 5) & 31] = rrb.display0
			rrb.display2 = rrb.display2.slice(0)
			rrb.display2[(focus >> 10) & 31] = rrb.display1
			return rrb;
		case 4 :
			rrb.display1 = rrb.display1.slice(0)
			rrb.display1[(focus >> 5) & 31] = rrb.display0
			rrb.display2 = rrb.display2.slice(0)
			rrb.display2[(focus >> 10) & 31] = rrb.display1
			rrb.display3 = rrb.display3.slice(0)
			rrb.display3[(focus >> 15) & 31] = rrb.display2
			return rrb;
		case 5 :
			rrb.display1 = rrb.display1.slice(0)
			rrb.display1[(focus >> 5) & 31] = rrb.display0
			rrb.display2 = rrb.display2.slice(0)
			rrb.display2[(focus >> 10) & 31] = rrb.display1
			rrb.display3 = rrb.display3.slice(0)
			rrb.display3[(focus >> 15) & 31] = rrb.display2
			rrb.display4 = rrb.display4.slice(0)
			rrb.display4[(focus >> 20) & 31] = rrb.display3
			return rrb;
		case 6 :
			rrb.display1 = rrb.display1.slice(0)
			rrb.display1[(focus >> 5) & 31] = rrb.display0
			rrb.display2 = rrb.display2.slice(0)
			rrb.display2[(focus >> 10) & 31] = rrb.display1
			rrb.display3 = rrb.display3.slice(0)
			rrb.display3[(focus >> 15) & 31] = rrb.display2
			rrb.display4 = rrb.display4.slice(0)
			rrb.display4[(focus >> 20) & 31] = rrb.display3
			rrb.display5 = rrb.display5.slice(0)
			rrb.display5[(focus >> 25) & 31] = rrb.display4
			return rrb;
	}
}

export function copyDisplays(depth, focus, list) {
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

export function makeTransientIfNeeded(list) {
	if (list.depth > 1 && !list.transient) {
		copyDisplaysAndNullFocusedBranch(list.depth, list.focus | list.focusRelax, list);

		list.transient = true
	}
}

function withRecomputeSizes(node, currentDepth, branchToUpdate) {

	var end = node.length - 1;
	var oldSizes = node[end];
	if (oldSizes != null) {
		// var newSizes = new Array(end);
		var newSizes = makeIntArray(end)

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

	var last = node[end - 1];
	return !!(currentDepth > 2 && last[last.length - 1] != null);

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

export function getIndexInSizes(sizes, indexInSubTree) {
	if (indexInSubTree == 0) return 0;
	var is = 0;
	while (sizes[is] <= indexInSubTree)
		is += 1;
	return is;
}

export function focusOnLastBlockǃ(_endIndex, list) {
	// vector focus is not focused block of the last element
	if (((list.focusStart + list.focus) ^ (_endIndex - 1)) >= 32) {
		return normalizeAndFocusOnǃ(_endIndex - 1, list);
	}
	return list;
}

export function focusOnFirstBlockǃ(list) {
	// the current focused block is not on the left most leaf block of the vector
	if (list.focusStart != 0 || (list.focus & -32) != 0) {
		return normalizeAndFocusOnǃ(0, list);
	}
	return list;
}

export function normalizeAndFocusOnǃ(index, rrb) {
	if (rrb.transient) {
		normalize(rrb.depth, rrb);
		rrb.transient = false
	}
	return focusOnǃ(index, rrb);
}

export function focusOnǃ(index, rrb) {
	var {focusStart, focusEnd, focus} = rrb;

	if (focusStart <= index && index < focusEnd) {
		var indexInFocus = index - focusStart;
		var xor = indexInFocus ^ focus;
		if (xor >= 32)
			gotoPos(indexInFocus, xor, rrb);
		rrb.focus = indexInFocus;
	} else {
		gotoPosFromRoot(index, rrb)
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
		var display = rrb['display' + depth - 1];
		do {
			var sizes = display[display.length - 1];
			if (sizes == null) {
				break;
			}
			var is = getIndexInSizes(sizes, index - _startIndex);
			display = display[is];
			if (depth == 2) {
				rrb.display0 = display
				break;
			} else if (depth == 3) {
				rrb.display1 = display
			} else if (depth == 4) {
				rrb.display2 = display
			} else if (depth == 5) {
				rrb.display3 = display
			} else if (depth == 6) {
				rrb.display4 = display
			}
			if (is < sizes.length - 1)
				endIndex = _startIndex + sizes[is];

			if (is != 0)
				_startIndex += sizes[is - 1];

			depth -= 1;
			_focusRelax |= is << (5 * depth)
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



export function copyDisplaysAndNullFocusedBranch(depth, focus, list) {

	switch (depth) {
		case 2 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31)
			return
		case 3 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31)
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31)
			return
		case 4 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31)
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31)
			list.display3 = copyOfAndNull(list.display3, (focus >> 15) & 31)
			return
		case 5 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31)
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31)
			list.display3 = copyOfAndNull(list.display3, (focus >> 15) & 31)
			list.display4 = copyOfAndNull(list.display4, (focus >> 20) & 31)
			return
		case 6 :
			list.display1 = copyOfAndNull(list.display1, (focus >> 5) & 31)
			list.display2 = copyOfAndNull(list.display2, (focus >> 10) & 31)
			list.display3 = copyOfAndNull(list.display3, (focus >> 15) & 31)
			list.display4 = copyOfAndNull(list.display4, (focus >> 20) & 31)
			list.display5 = copyOfAndNull(list.display5, (focus >> 25) & 31)
			return
	}
}


function copyOfAndNull(array, nullIndex) {
	var len = array.length;
	var newArray = array.slice(0);
	newArray[nullIndex] = null;
	var sizes = array[len - 1];
	if (sizes != null) {
		newArray[len - 1] = makeTransientSizes(sizes, nullIndex)
	}
	return newArray;
}

export function makeTransientSizes(oldSizes, transientBranchIndex) {
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
		i += 1
	}
	return newSizes;
}

// create a new block at tail
export function setupNewBlockInNextBranch(xor, transient, list) {
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
			list.display1 = [list.display0, null, null]
		} else {
			list['display' + _depth] = makeNewRoot0(list['display' + (_depth - 1)])
		}
	} else {
		var newRoot = copyAndIncRightRoot(list['display' + _depth], list.transient, _depth);
		if (list.transient) {
			var transientBranch = newRoot.length - 3
			newRoot[transientBranch] = list['display' + (_depth - 1)]
			withRecomputeSizes(newRoot, _depth + 1, transientBranch);
			list['display' + _depth] = newRoot;
		}
	}
	switch(_depth) {
		case 5:
			list.display4 = emptyTransientBlock;
		case 4:
			list.display3 = emptyTransientBlock
		case 3:
			list.display2 = emptyTransientBlock
		case 2:
			list.display1 = emptyTransientBlock
		case 1:
			list.display0 = new Array(1);
	}
}

// create a new block before head
export function setupNewBlockInInitBranch(_depth, transient, list) {

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
		list['display' + (_depth - 1)] = [null, list['display' + (_depth - 2)], [0, delta]]
	} else {
		// [null, list.display_...] from above should get un-nulled ?
		var newRoot = copyAndIncLeftRoot(list['display' + (_depth - 1)], list.transient, _depth - 1)

		if (list.transient) {
			console.log('PreWithRecom', _depth, newRoot.length, JSON.stringify(newRoot.slice(0, 1)));
			// newRoot[0] is always null here
			// but why is newRoot[1] supposedly null?
			withRecomputeSizes(newRoot, _depth, 1)
			console.log('not made it')
			newRoot[1] = list['display' + (_depth - 2)]
		}
		list['display' + (_depth - 1)] = newRoot
	}

	switch(_depth) {
		case 6:
			list.display4 = emptyTransientBlock;
		case 5:
			list.display3 = emptyTransientBlock
		case 4:
			list.display2 = emptyTransientBlock
		case 3:
			list.display1 = emptyTransientBlock;
		case 2:
			list.display0 = new Array(1);
	}
}




// ====================================================================

// add extra rrb sizes to the node
export function withComputedSizes(node, currentDepth) {
	var i = 0;
	var acc = 0;
	var end = node.length - 1;
	if (end > 1) {
		var sizes = new Array(end);
		while (i < end) {
			acc += treeSize(node[i], currentDepth - 1);
			sizes[i] = acc;
			i += 1
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

export function withComputedSizes1(node) {
	var i = 0;
	var acc = 0;
	var end = node.length - 1;
	if (end > 1) {
		var sizes = new Array(end);
		while (i < end) {
			acc += node[i].length;
			sizes[i] = acc;
			i += 1
		}
		/* if node is not balanced */
		if (sizes(end - 2) != ((end - 1) << 5))
			node[end] = sizes
	}
	return node;
}

export function makeNewRoot0(node/* Array<T>*/) {
	var dLen = node.length;
	var dSizes = node[dLen - 1];
	var sizes = null;
	if (dSizes != null) {
		var dSize = dSizes[dLen - 2] || 0;
		sizes = [dSize, dSize];
	}
	return [node, null, sizes];
}

export function makeNewRoot1(node, currentDepth) {

	return [null, node, [0, treeSize(node, currentDepth - 1)]]
}


export function copyAndIncRightRoot(node, transient, currentLevel) {
	var len = node.length;
	var newRoot = new Array(len + 1)
	arraycopy(node, 0, newRoot, 0, len - 1)
	var oldSizes = node[len - 1];
	if (oldSizes != null) {
		var newSizes = makeIntArray(len)
		arraycopy(oldSizes, 0, newSizes, 0, len - 1)

		if (transient) {
			newSizes[len - 1] = 1 << (5 * currentLevel)
		}

		newSizes[len - 1] = newSizes[len - 2] || 0;
		newRoot[len] = newSizes;
	}
	return newRoot
}

function copyAndIncLeftRoot(node, transient, currentLevel) {
	// throw new Error("incleft node", JSON.stringify(node))
	console.warn('incleft')
	var len = node.length
	var newRoot = new Array(len + 1)
	arraycopy(node, 0, newRoot, 1, len - 1)

	var oldSizes = node[len - 1]
	var newSizes = makeIntArray(len)
	if (oldSizes != null) {
		if (transient) {
			arraycopy(oldSizes, 1, newSizes, 2, len - 2)
		} else {
			arraycopy(oldSizes, 0, newSizes, 1, len - 1)
		}
	} else {
		var subTreeSize = 1 << (5 * currentLevel)
		var acc = 0
		var i = 1
		while (i < len - 1) {
			acc += subTreeSize
			newSizes[i] = acc
			i += 1
		}
		newSizes[i] = acc + treeSize(node[node.length - 2], currentLevel)
	}
	newRoot[len] = newSizes
	// console.log('is returning:', JSON.stringify(newRoot))
	return newRoot
}

export function stabilizeDisplayPath(depth, focus, list) {
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

export function computeBranching(displayLeft, concat, displayRight, currentDepth) {
	var leftLength = (displayLeft == null) ? 0 : displayLeft.length - 1
	var concatLength = (concat == null) ? 0 : concat.length - 1
	var rightLength = (displayRight == null) ? 0 : displayRight.length - 1
	var branching = 0;
	if (currentDepth == 1) {
		branching = leftLength + concatLength + rightLength
		if (leftLength != 0)
			branching -= 1
		if (rightLength != 0)
			branching -= 1
	} else {
		var i = 0
		while (i < leftLength - 1) {
			branching += displayLeft[i].length
			i += 1
		}
		i = 0
		while (i < concatLength) {
			branching += concat[i].length
			i += 1
		}
		i = 1
		while (i < rightLength) {
			branching += displayRight[i].length
			i += 1
		}
		if (currentDepth != 2) {
			branching -= leftLength + concatLength + rightLength
			if (leftLength != 0)
				branching += 1
			if (rightLength != 0)
				branching += 1
		}

	}
	return branching;
}