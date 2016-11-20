import {tableOf, isLeaf} from '../accessors';

//iterator value signatures
function done()     { return { done: true,  value: null} }
function value(val) { return { done: false, value: val }; }


/**
 * iterator that starts from tail and works backwards
 * @param list
 */
export default function tailIterator(list) {
	throw new Error("feature not yet implemented");

	return isLeaf(list) ? _leafIterator(list) : _nodeIterator(list);


	function _leafIterator(leaf) {
		var table = tableOf(leaf);
		var i = table.length;

		return {
			next() {
				return --i >= 0 ? value(table[i]) : done();
			}
		}
	}

	function _nodeIterator(node) {
		var table = tableOf(node);
		var len = table.length;
		var current = tailIterator(table[--len]); //table cannot have 0 length because it's a container, so we're "safe" TM

		return {
			next() {
				var response = current.next();
				if (!response.done)
					return response;

				// current iterator is done, get the next iterator and result
				return (--len >= 0 ?  (current = tailIterator(table[len])).next() : done() );
			}
		}
	}


}
