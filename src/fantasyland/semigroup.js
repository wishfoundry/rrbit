/**
 *
 *
 * Semigroup

 a.concat(b).concat(c) is equivalent to a.concat(b.concat(c)) (associativity)
 concat method

 concat :: Semigroup a => a ~> a -> a
 A value which has a Semigroup must provide a concat method. The concat method takes one argument:

 s.concat(b)
 b must be a value of the same Semigroup

 If b is not the same semigroup, behaviour of concat is unspecified.
 concat must return a value of the same Semigroup.

 *
 */

// import fl from 'fantasy-land';
// import {Node as List, isNode} from '../Node';
// import {append} from '../append';
// import {push} from '../internal';
//
//
// function _concat(thing, list) {						// Semigroup compat
// 	if (isNode(thing))
// 		return append(list, thing); // if a semigroup is provided, must return same type
//
// 	return push(thing, list); // if not a semigroup, behavior is not specified
// }
//
// List.prototype.concat = function (value) {
// 	return _concat(value, this);
// };
//
// List.prototype[fl.concat] = function (value) {
// 	return _concat(value, this);
// };