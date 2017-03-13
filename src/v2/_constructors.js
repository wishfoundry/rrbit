
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

export function empty() {
	var list = withLength(0);
	list.focus = 0;
	list.focusStart = 0;
	list.focusEnd = 1;
	list.focusDepth = 1;
	list.focusRelax = 0;
	list.display0 = [];
	/*
	 list.display1 = [];
	 list.display2 = [];
	 list.display3 = [];
	 list.display4 = [];
	 list.display5 = [];
	 /*/
	list.display1 = null;
	list.display2 = null;
	list.display3 = null;
	list.display4 = null;
	list.display5 = null;
	//*/
	list.depth = 1;
	return list;
}

export const EMPTY = empty();


export function fromFocusOf(src) {
	var list = withLength(src.length);
	list.focusStart = src.focusStart;
	list.focusDepth = src.focusDepth;
	list.focusRelax = src.focusRelax;
	list.focusEnd = src.focusEnd;
	list.focus = src.focus;
	list.depth = src.depth;

	//todo: can we safely reuse refs, or is cloning required?
	// switch (src.depth) {
	// 	case 6:
	// 		list.display5 = src.display5.slice(0);
	// 	case 5:
	// 		list.display4 = src.display4.slice(0);
	// 	case 4:
	// 		list.display3 = src.display3.slice(0);
	// 	case 3:
	// 		list.display2 = src.display2.slice(0);
	// 	case 2:
	// 		list.display1 = src.display1.slice(0);
	// 	case 1:
	// 		list.display0 = src.display0.slice(0);
	// }

	// there's a small hack used here with endIndex, where we mutate a shared display
	list.display0 = src.display0
	list.display1 = src.display1
	list.display2 = src.display2
	list.display3 = src.display3
	list.display4 = src.display4
	list.display5 = src.display5

	return list;
}

function fromRoot() {}

export function withLength(len) {
	return new Node(len);
}

export function one(value) {
	var list = empty();
	list.endIndex = 1;
	list.display0 = [value];
	return list;
}

export const emptyTransientBlock = new Array(2);

export function isRRB(rrb) {
	return rrb instanceof Node;
}