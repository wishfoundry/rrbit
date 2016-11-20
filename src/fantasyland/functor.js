/**
 * Functor

 u.map(a => a) is equivalent to u (identity)
 u.map(x => f(g(x))) is equivalent to u.map(g).map(f) (composition)
 map method

 map :: Functor f => f a ~> (a -> b) -> f b
 A value which has a Functor must provide a map method. The map method takes one argument:

 u.map(f)
 f must be a function,

 If f is not a function, the behaviour of map is unspecified.
 f can return any value.
 No parts of f's return value should be checked.
 map must return a value of the same Functor
 *
 */

import fl from 'fantasy-land';
import {Node as List} from '../Node';

List.prototype[fl.map] = function(fn) {
	//our standard map provides arguments, but pure functional map is only 1
	return this.map((value, i) => fn(value));
};