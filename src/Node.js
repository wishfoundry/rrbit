
/**
 * an RRB tree has two data types:
 *
 * Leaf
 * - height is always 0
 * - table is an collection of values
 *
 * Parent
 * - height is always greater than 0
 * - table is collection of child nodes
 * - lengths is cache of accumulated lengths of children
 *
 * height and table are mandatory, lengths may be null
 *
 */

/**
 *
 * @param {Array} table
 * @return {Node}
 * @constructor
 */
export function Leaf(table) {
	return new Node(0, table, void 0);
}

/**
 *
 * @param {Number} height
 * @param {Array<Node>} table
 * @param {Array<number>} lengths
 * @return {Node}
 * @constructor
 */
export function Parent(height, table, lengths) {
	return new Node(height, table, lengths);
}

/**
 * The base list class
 * @param {number} height
 * @param {Array<Node|*>} table
 * @param {Array<number>} lengths
 * @constructor
 */
export function Node(height, table, lengths) {
	this['@@rrb/lengths'] = lengths;
	this['@@rrb/height'] = height;
	this['@@rrb/table'] = table;
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

export function isNode(item) {
	return item instanceof Node;
}

export function isLeaf(node) {
	return node['@@rrb/height'] === 0;
}

export function isParent(node) {
	return node['@@rrb/height'] > 0;
}