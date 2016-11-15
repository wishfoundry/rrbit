import {last} from './functional';

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
export function lengthsOf(list) {
	return list['@@rrb/lengths'];
}

export function heightOf(list) {
	return list['@@rrb/height'];
}

export function tableOf(list) {
	return list['@@rrb/table'];
}

export function tableLenOf(list) {
	return list['@@rrb/table'].length;
}


// determine if this is a leaf vs container node
export function isLeaf(node) {
	return node['@@rrb/height'] === 0;
}

// get the # of elements in a rrb list
export function length(list) {
	return isLeaf(list) ? list['@@rrb/table'].length : last(list['@@rrb/lengths']);
}