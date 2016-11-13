import {HEIGHT, LENGTHS, TABLE} from './constants';
import {getLast} from './functional';

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
	return list[LENGTHS];
}

export function heightOf(list) {
	return list[HEIGHT];
}

export function tableOf(list) {
	return list[TABLE];
}

export function tableLenOf(list) {
	return list[TABLE].length;
}


// determine if this is a leaf vs container node
export function isLeaf(node) {
	return node[HEIGHT] === 0;
}

// get the # of elements in a rrb list
export function length(list) {
	return isLeaf(list) ? tableOf(list).length : getLast(lengthsOf(list));
}