import {HEIGHT, LENGTHS, TABLE} from './constants';

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes


/**
 * The base list class
 * @param {number} height
 * @param {Array<Node|*>} table
 * @param {Array<number>} lengths
 * @constructor
 */
export function Node(height, table, lengths) {
	this[LENGTHS] = lengths;
	this[HEIGHT] = height;
	this[TABLE] = table;
}

Node.prototype.isEmpty  = () => false; // small optimization because all empty lists are the same element

Object.defineProperty(Node.prototype, 'length', {
	get() {
		return this.size();
	},
	set(value) {
		//do nothing
	}
});

export const EMPTY = Object.assign(new Node(0, []), {
	isEmpty() { return true; },
	size() { return 0; }
});

export function isListNode(item) {
	return item instanceof Node;
}