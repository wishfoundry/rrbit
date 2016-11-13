import {isLeaf, tableOf} from './accessors';

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


// generator version of above
// export function* iteratorGen () {
// 	if (isLeaf(this)) {
// 		for (var value of tableOf(this)) {
// 			yield value;
// 		}
// 	} else {
// 		for (var subTable of tableOf(this)) {
// 			yield * subTable;
// 		}
// 	}
// }



/**
 * iterator that starts from tail and works backwards
 * @param list
 */
export function tailIterator(list) {
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
				return (--len >= 0 ?  (current = iterator(table[len])).next() : done() );
			}
		}
	}


}


// export function* tailIteratorGen() {
// 	var table = tableOf(this);
// 	var i = table.length;
// 	if (isLeaf(this)) {
// 		while(i--) {
// 			yield table[i];
// 		}
// 	} else {
// 		while(i--) {
// 			yield * table[i];
// 		}
// 	}
// };