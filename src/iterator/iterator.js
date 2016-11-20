import {isLeaf, tableOf} from '../accessors';

//iterator value signatures
function done()     { return { done: true,  value: null} }
function value(val) { return { done: false, value: val }; }

/**
 * create a js iterator for a list
 *
 * @param {Node} list
 * @return {Iterator}
 */
export default function iterator(list) {
	return isLeaf(list) ? _leafIterator(list) : _nodeIterator(list);

	function _leafIterator(leaf) {
		var table = tableOf(leaf);
		var len = table.length;
		var i = 0;

		return {
			next() {
				return len > i ? value(table[i++]) : done();
			}
		}
	}

	function _nodeIterator(node) {
		var table = tableOf(node);
		var len = table.length;
		var i = 0;
		var current = iterator(table[0]);

		return {
			next() {
				var response = current.next();
				if (!response.done)
					return response;

				// current iterator is done, get the next iterator and result
				return (++i >= len ? done() : (current = iterator(table[i])).next());
			}
		}
	}


}
