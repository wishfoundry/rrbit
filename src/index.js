import {length} from './accessors';
import {of, one, empty, times, from, range} from './constructors';
import {Node as List, isListNode, EMPTY} from './Node';
import {tailIterator, default as iterator} from './iterator';
import * as ops from './operations';
const {
	push,
	append,
	get,
	set,
	map,
	slice,
	filter,
	foldr,
	foldl,
	insertAt,
	removeAt,
	removeItem,
	indexOf,
	reverse} = ops;
import fl from 'fantasy-land';

const $$iter = Symbol.iterator || "@@iterator";
let proto = List.prototype;


// == setup static methods ============================================================================================

List.of = of;
List.from = from;
List.empty = empty;
List.times = times;
List.range = range;
//node.length is reserved, us lengthOf instead
List.lengthOf = length;
List.push = push;
List.append = append;
List.get = get;
List.set = set;
List.map = map;
List.slice = slice;
List.filter = filter;
List.foldr = foldr;
List.foldl = foldl;
List.reverse = reverse;
List.removeAt = removeAt;
List.removeItem = removeItem;
List.indexOf = indexOf;



// == setup list prototype ============================================================================================

// iterator support
proto[$$iter]         = function() {
	return iterator(this);
};
proto.values          = function() {
	return iterator(this);
};
proto.valuesInReverse = function() {
	return tailIterator(this);
};

// metadata
proto.isEmpty  = () => false; // small optimization because all empty lists are the same element
proto.size     = function() { return length(this); };

// list operations
proto.append   = function(list) { return append(this, list); }; //append only accepts a list(does not behave like Array#concat)
proto.prepend  = function(list) { return append(list, this); };
proto.push     = function(item) { return push(item, this); };
proto.get      = function(i) { return get(i, this); };
proto.set      = function(i, item) { return set(i, item, this); };
proto.foldl    = function(fn, acc) { return foldl(fn, acc, this); };
proto.foldr    = function(fn, acc) { return foldr(fn, acc, this); };
proto.slice    = function(from = 0, to) { return slice(from, to || this.length, this); };
proto.head     = function() { return this.get(0); };
proto.tail     = function() { return this.slice(1); };
proto.filter   = function(fn) { return filter(fn, this); };
proto.reverse  = function() { return reverse(this); };

proto.toArray  = function() { return foldl(addTo, [], this); };

function addTo(value, array) {
	array.push(value);
	return array;
}

// == fantasy-land compatibility ======================================================================================

proto.of = function(item) {								// Applicative compat
	return one(item);
};

proto.chain = proto.concatMap = function(f) {
	//note: this is single level concat, but most functional level concat
	// rules define this as fully recursive
	return foldr((value, acc) =>
			_concat(f(value), acc), EMPTY, this);

	// recursive concat ???

	// function _concat(list) {
	// 	if (list.length === 0)
	// 		return empty();
	// 	return list.head().concat(_concat(list.tail()));
	// }
	//
	// return _concat(this.map(f));
};

// rules of applicative
// 1) assume 'this' is an collection of functions
// 2) assume argument is an array of values
// 3) return an array of values, where every function in  this has been applied
proto.ap = function(values) {
	return this.map(fn =>
		values.map(fn));
};


proto.map      = function(fn) { return map(fn, this); };// Functor compat. todo: verify this works, we accept 2 args instead of requiring 1
proto.empty = empty;									// Monoid compat
function _concat(thing, list) {						// Semigroup compat
	if (isListNode(thing)) return append(list, thing); // if a semigroup is provided, must return same type

	return push(thing, list); // if not a semigroup, behavior is not specified
}
proto.concat = function (value) {
	return _concat(value, this);
};

proto[fl.of] = of;
List[fl.of]  = of;
proto[fl.empty] = empty;
List[fl.empty]  = empty;
proto[fl.ap] = proto.ap;
List[fl.ap]  = proto.ap;
proto[fl.map] = proto.map;
List[fl.map]  = proto.map;
proto[fl.chain] = proto.chain;
List[fl.chain]  = proto.chain;
proto[fl.concat] = proto.concat;
List[fl.concat]  = proto.concat;


// == exports ========================================================================================================


// one last thing to do now that we've finished modifying it
Object.freeze(EMPTY);

export default List;