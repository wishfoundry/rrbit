import {
	focusOnLastBlockǃ,
	normalize,
	makeTransientIfNeeded,
	withComputedSizes,
	withComputedSizes1,
	computeBranching,
	focusOnǃ
} from './_vectorPointer';
import {fromFocusOf} from './_constructors';
import {arraycopy} from './_array';
import nth from './nth';
import {appendBackNewBlock} from './append';

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
export default function appendAll(left, right) {
	if (left.endIndex == 0) return right;
	if (right.endIndex == 0) return left;

	// do short/fast append
	if (1024 < left.endIndex && right.endIndex <= 32) {
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
	var newEndIndex = left.endIndex = left0.endIndex + right.endIndex
	var currentEndIndex = left0.endIndex;

	focusOnLastBlockǃ(currentEndIndex, left)
	makeTransientIfNeeded(left)

	var i = 0
	while (currentEndIndex < newEndIndex) {
		var elemIndexInBlock = (currentEndIndex - left.focusStart) & 31

		/* if next element will go in current block position */
		if (elemIndexInBlock != 0) {
			var batchSize = Math.min(32 - elemIndexInBlock, _right.length - i)
			var d0 = new Array(elemIndexInBlock + batchSize)
			arraycopy(left.display0, 0, d0, 0, elemIndexInBlock)
			arraycopy(right, i, d0, elemIndexInBlock, batchSize)
			left.display0 = d0
			currentEndIndex += batchSize
			left.focusEnd = currentEndIndex
			i += batchSize
		} else /* next element will go in a new block position */ {
			appendBackNewBlock(nth(i, right), currentEndIndex)
			currentEndIndex += 1
			i += 1
		}
	}

}


function appendTreesǃ(left, that) {
	var d0 = null
	var d1 = null
	var d2 = null
	var d3 = null
	var d4 = null
	var d5 = null
	var concat;

	var currentSize = left.endIndex;
	left.endIndex = left.endIndex + that.endIndex
	var thisDepth = left.depth
	var thatDepth = that.depth
	if (left.transient) {
		normalize(thisDepth, left)
		left.transient = false
	}

	if (that.transient) {
		normalize(thatDepth, that);
		that.transient = false
	}

	focusOnǃ(currentSize - 1, left);
	var maxDepth = Math.max(left.depth, that.depth);

	if (maxDepth === 1) {
		concat = rebalancedLeafs(left.display0, that.display0, true);
		return initFromRoot(concat, currentSize <= 32 ? 1 : 2, left);
	}

	if ((that.focus & -32) == 0) {
		switch (maxDepth) {
			case 6 :
				d5 = that.display5;
			case 5 :
				d4 = that.display4;
			case 4 :
				d3 = that.display3;
			case 3 :
				d2 = that.display2;
			case 2 :
				d1 = that.display1;
				d0 = that.display0;
		}
	} else {
		switch (maxDepth) {
			case 2 :
				d1 = that.display1
				d0 = d1 ? that.display0 : d1[0]
				break;
			case 3 :
				d2 = that.display2
				d1 = d2 ? that.display1 : d2[0]
				d0 = d1 ? that.display0 : d1[0]
				break

			case 4 :
				d3 = that.display3
				d2 = d3 ? that.display2 : d3[0]
				d1 = d2 ? that.display1 : d2[0]
				d0 = d1 ? that.display0 : d1[0]
				break;
			case 5 :
				d4 = that.display4
				d3 = d4 ? that.display3 : d4[0]
				d2 = d3 ? that.display2 : d3[0]
				d1 = d2 ? that.display1 : d2[0]
				d0 = d1 ? that.display0 : d1[0]
				break;
			case 6 :
				d5 = that.display5
				d4 = d5 ? that.display4 : d5[0]
				d3 = d4 ? that.display3 : d4[0]
				d2 = d3 ? that.display2 : d3[0]
				d1 = d2 ? that.display1 : d2[0]
				d0 = d1 ? that.display0 : d1[0]
				break;
		}
	}


	// depth 1 is already covered
	concat = rebalancedLeafs(left.display0, d0, false)
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
		initFromRoot(concat[0], maxDepth, left)
	} else {
		initFromRoot(withComputedSizes(concat, maxDepth + 1), maxDepth + 1, left)
	}

	return left;
}



function rebalancedLeafs(displayLeft, displayRight, isTop) {
	var leftLength = displayLeft.length
	var rightLength = displayRight.length

	if (leftLength == 32) {
		return [displayLeft, displayRight, null];
	} else if (leftLength + rightLength <= 32) {
		var mergedDisplay = new Array(leftLength + rightLength)
		arraycopy(displayLeft, 0, mergedDisplay, 0, leftLength)
		arraycopy(displayRight, 0, mergedDisplay, leftLength, rightLength)

		return isTop ? mergedDisplay : [mergedDisplay, null];
	}

	var arr0 = new Array(32)
	var arr1 = new Array(leftLength + rightLength - 32)
	arraycopy(displayLeft, 0, arr0, 0, leftLength)
	arraycopy(displayRight, 0, arr0, leftLength, 32 - leftLength)
	arraycopy(displayRight, 32 - leftLength, arr1, 0, rightLength - 32 + leftLength)
	return [arr0, arr1, null];

}

function rebalanced(displayLeft, concat, displayRight, currentDepth) {
	var leftLength = (displayLeft == null) ? 0 : displayLeft.length - 1
	var concatLength = (concat == null) ? 0 : concat.length - 1
	var rightLength = (displayRight == null) ? 0 : displayRight.length - 1
	var branching = computeBranching(displayLeft, concat, displayRight, currentDepth)
	var top = new Array((branching >> 10) + (((branching & 1023) == 0) ? 1 : 2))
	var mid = new Array(((branching >> 10) == 0) ? ((branching + 31) >> 5) + 1 : 33)
	var bot;
	var iSizes = 0
	var iTop = 0
	var iMid = 0
	var iBot = 0
	var i = 0
	var j = 0
	var d = 0
	var currentDisplay;
	var displayEnd = 0
	do {
		switch (d) {
			case 0 :
				if (displayLeft != null) {
					currentDisplay = displayLeft;
					displayEnd = (concat == null) ? leftLength : leftLength - 1
				}
				break;
			case 1 :
				if (concat == null)
					displayEnd = 0;
				else {
					currentDisplay = concat;
					displayEnd = concatLength
				}
				i = 0;
				break;
			case 2 :
				if (displayRight != null) {
					currentDisplay = displayRight
					displayEnd = rightLength
					i = (concat == null) ? 0 : 1
				}
				break;
		}
		while (i < displayEnd) {
			var displayValue = currentDisplay[i]
			var displayValueEnd = (currentDepth == 2) ? displayValue.length : displayValue.length - 1;
			if ((iBot | j) == 0 && displayValueEnd == 32) { // the current block in displayValue can be used directly (no copies)
				if (currentDepth != 2 && bot != null) {
					withComputedSizes(bot, currentDepth - 1)
					bot = null
				}
				mid[iMid] = displayValue;
				i += 1
				iMid += 1
				iSizes += 1
			} else {
				var numElementsToCopy = Math.min(displayValueEnd - j, 32 - iBot)
				if (iBot == 0) {
					if (currentDepth != 2 && bot != null)
						withComputedSizes(bot, currentDepth - 1);
					var _min = (branching - (iTop << 10) - (iMid << 5), 32)
					var __len = Math.min(branching - (iTop << 10) - (iMid << 5), 32) + (currentDepth == 2 ? 0 : 1)
					if (__len !== 32) {
						'foo';
					} else {
						'foo';
					}
					bot = new Array(__len)
					mid[iMid] = bot
				}

				arraycopy(displayValue, j, bot, iBot, numElementsToCopy);
				j += numElementsToCopy;
				iBot += numElementsToCopy;
				if (j == displayValueEnd) {
					i += 1;
					j = 0;
				}

				if (iBot == 32) {
					iMid += 1
					iBot = 0
					iSizes += 1
					if (currentDepth != 2 && bot != null)
						withComputedSizes(bot, currentDepth - 1)
				}

			}
			if (iMid == 32) {
				top[iTop] = (currentDepth == 1) ? withComputedSizes1(mid) : withComputedSizes(mid, currentDepth);
				iTop += 1;
				iMid = 0;
				var remainingBranches = branching - ((iTop << 10) | (iMid << 5) | iBot)
				if (remainingBranches > 0)
					mid = new Array(((remainingBranches >> 10) == 0) ? (remainingBranches + 63) >> 5 : 33)
				else
					mid = null
			}

		}
		d += 1
	} while (d < 3);

	if (currentDepth != 2 && bot != null)
		withComputedSizes(bot, currentDepth - 1);

	if (mid != null)
		top[iTop] = (currentDepth == 1) ? withComputedSizes1(mid) : withComputedSizes(mid, currentDepth)

	return top
}

function initFromRoot(root, depth, rrb) {
	//if (depth !== 0) // shouldn't need this if
	rrb['display' + (depth - 1)] = root;

	rrb.depth = depth
	rrb.focusEnd = rrb.focusStart
	rrb['display' + (depth - 1)] = root
	focusOnǃ(0, rrb);
	return rrb;
}