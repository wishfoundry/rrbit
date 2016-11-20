/**
 *
 * Chain

 A value that implements the Chain specification must also implement the Apply specification.

 m.chain(f).chain(g) is equivalent to m.chain(x => f(x).chain(g)) (associativity)
 chain method

 chain :: Chain m => m a ~> (a -> m b) -> m b
 A value which has a Chain must provide a chain method. The chain method takes one argument:

 m.chain(f)
 f must be a function which returns a value

 If f is not a function, the behaviour of chain is unspecified.
 f must return a value of the same Chain
 chain must return a value of the same Chain
 *
 */

import fl from 'fantasy-land';
import {Node as List, EMPTY, isNode} from '../Node';
import foldr from '../operations/foldr';
import {append} from '../append';
import {push} from '../internal';

function _concat(thing, list) {						// Semigroup compat
	if (isNode(thing))
		return append(list, thing); // if a semigroup is provided, must return same type

	return push(thing, list); // if not a semigroup, behavior is not specified
}

function chain(f) {
	//note: this is single level concat, but most functional level concat
	// rules define this as fully recursive... do we need to?
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
}

List.prototype[fl.chain] = List.prototype.chain = List.prototype.flatMap = chain;