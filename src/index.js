import {length} from './accessors';
import {of, one, empty, times} from './constructors';
import {Node, isListNode, EMPTY} from './Node';
import {iteratorGen, tailIteratorGen, tailIterator, default as iterator} from './iterator';
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
	reverse,
} = ops;



// == setup list prototype ============================================================================================
const $$iter = Symbol.iterator || "@@iterator";

var proto = Node.prototype;

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
proto.filter   = function(fn) { return filter(fn, this); };
proto.reverse  = function() { return reverse(this); };
proto.toArray  = function() { return foldl(addTo, [], this); };

//fantasy-land compatibility
proto.of = function(item) {								// Applicative compat
	return one(item);
};
proto.ap = function() {};
proto.map      = function(fn) { return map(fn, this); };// Functor compat. todo: verify this works, we accept 2 args instead of requiring 1
proto.empty = empty;									// Monoid compat
proto.concat = function(thing) {						// Semigroup compat
	if (isListNode(thing)) return append(this, thing); // if a semigroup is provided, must return same type

	return push(thing, list); // if not a semigroup, behavior is not specified
};


function addTo(value, array) {
	array.push(value);
	return array;
}


// one last thing to do now that we've finished modifying it
Object.freeze(EMPTY);

export {
	of,
	one,
	empty,
	times,

	length,

	push,
	append,
	get,
	set,
	map,
	slice,
	filter,
	foldr,
	foldl,
	reverse,
};