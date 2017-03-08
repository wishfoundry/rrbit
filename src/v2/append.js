import {one, fromFocusOf} from './_constructors';
import {
	focusOnLastBlockǃ,
	makeTransientIfNeeded,
	makeTransientSizes,
	setupNewBlockInNextBranch} from './_vectorPointer';
import {arraycopy} from './_array';



/**
 * append one value to end of list, returning a new list
 *
 * @param {T} value
 * @param {Node<T>} list
 * @return {Node<T>}
 */
export function append(value, list) {
	if (list.endIndex === 0) {
		return one(value);
	}

	var x = fromFocusOf(list);
	x.endIndex = list.endIndex;
	x.transient = list.transient;
	x.endIndex = list.endIndex + 1



	focusOnLastBlockǃ(list.endIndex, x);

	var elemIndexInBlock = (list.endIndex - x.focusStart) & 31;
	if  (elemIndexInBlock === 0) {
		// next element will go in a new block position
		appendBackNewBlock(value, list.endIndex, x)
	} else {
		// if next element will go in current block position
		appendOnCurrentBlock(value, elemIndexInBlock, x)
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
export function appendǃ(value, list) {
	if (list.endIndex === 0) {
		return one(value);
	}

	var x = fromFocusOf(list);
	x.endIndex = list.endIndex;
	x.transient = list.transient;
	x.endIndex = list.endIndex + 1

	focusOnLastBlockǃ(list.endIndex, x);

	var elemIndexInBlock = (list.endIndex - x.focusStart) & 31;
	if  (elemIndexInBlock === 0) {
		// next element will go in a new block position
		appendBackNewBlock(value, list.endIndex, x)
	} else {
		// if next element will go in current focused block
		x.focusEnd = x.endIndex;
		x.display0[elemIndexInBlock] = value;
		makeTransientIfNeeded(x)
	}

	return x;
}


function appendOnCurrentBlock(value, elemIndexInBlock, list) {

	list.focusEnd = list.endIndex;
	var d0 = list.display0.slice(0);
	d0[elemIndexInBlock] = value
	// d0.push(value)
	list.display0 = d0
	makeTransientIfNeeded(list)
}

function appendBackNewBlock(elem, _endIndex, list) {
	var oldDepth = list.depth
	var newRelaxedIndex = _endIndex - list.focusStart + list.focusRelax;
	var focusJoined = list.focus | list.focusRelax
	var xor = newRelaxedIndex ^ focusJoined

	setupNewBlockInNextBranch(xor, list.transient, list);

	// setupNewBlockInNextBranch(...) increased the depth of the tree
	if (oldDepth == list.depth) {
		var i = xor < 1024 ? 2 :
				(xor < 32768 ? 3 :
					(xor < 1048576 ? 4 :
						(xor < 33554432 ? 5 :
							6)));

		if (i < oldDepth) {
			var _focusDepth = list.focusDepth
			var display = list['display' + i];
			do {
				var displayLen = display.length - 1
				var oldSizes = display[displayLen]
				var newSizes = (i >= _focusDepth && oldSizes != null) ?
					makeTransientSizes(oldSizes, displayLen - 1)
					: null;

				var newDisplay = new Array(display.length)
				arraycopy(display, 0, newDisplay, 0, displayLen - 1)
				if (i >= _focusDepth)
					newDisplay[displayLen] = newSizes

				switch (i) {
					case 2 :
						list.display2 = newDisplay
						display = list.display3;
						break;
					case 3 :
						list.display3 = newDisplay
						display = list.display4;
						break;
					case 4 :
						list.display4 = newDisplay
						display = list.display5;
						break;
					case 5 :
						list.display5 = newDisplay
				}
				i += 1
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
	list.display0[0] = elem
	list.transient = true;
}

// function appendBackNewBlock(elem, _endIndex, list) {
// 		var oldDepth = list.depth
// 		var newRelaxedIndex = _endIndex - focusStart + focusRelax
// 		var focusJoined = focus | focusRelax
// 		var xor = newRelaxedIndex ^ focusJoined
// 		var _transient = transient
// 		setupNewBlockInNextBranch(xor, list.transient)
// 	/* setupNewBlockInNextBranch(...) increased the depth of the tree */
// 		if  (oldDepth == depth) {
// 			var i = xor < 1024 ? 2 :
// 				(xor < 32768 ? 3 :
// 					(xor < 1048576 ? 4 :
// 						(xor < 33554432 ? 5 :
// 							6)));
//
// 	if (i < oldDepth) {
// 		var _focusDepth = focusDepth
// 		var display: Array[AnyRef] = i match {
// 		case 2 => display2
// 		case 3 => display3
// 		case 4 => display4
// 		case 5 => display5
// 		}
// 		do {
// 			val displayLen = display.length - 1
// 			val oldSizes = display(displayLen)
// 			val newSizes: Array[Int] =
// 			if (i >= _focusDepth && oldSizes != null) {
// 				makeTransientSizes(oldSizes.asInstanceOf[Array[Int]], displayLen - 1)
// 			} else null
//
// 			val newDisplay = new Array[AnyRef](display.length)
// 			System.arraycopy(display, 0, newDisplay, 0, displayLen - 1)
// 			if (i >= _focusDepth)
// 				newDisplay(displayLen) = newSizes
//
// 			i match {
// 			case 2 =>
// 				display2 = newDisplay
// 				display = display3
// 			case 3 =>
// 				display3 = newDisplay
// 				display = display4
// 			case 4 =>
// 				display4 = newDisplay
// 				display = display5
// 			case 5 =>
// 				display5 = newDisplay
// 			}
// 			i += 1
// 		} while (i < oldDepth)
// 	}
// }
//
// if (oldDepth == focusDepth)
// 	initFocus(_endIndex, 0, _endIndex + 1, depth, 0)
// else
// 	initFocus(0, _endIndex, _endIndex + 1, 1, newRelaxedIndex & -32)
//
// display0(0) = elem.asInstanceOf[AnyRef]
// transient = true
// }