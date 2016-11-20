/**
 *
 * Apply

 A value that implements the Apply specification must also implement the Functor specification.

 v.ap(u.ap(a.map(f => g => x => f(g(x))))) is equivalent to v.ap(u).ap(a) (composition)
 ap method

 ap :: Apply f => f a ~> f (a -> b) -> f b
 A value which has an Apply must provide an ap method. The ap method takes one argument:

 a.ap(b)
 b must be an Apply of a function,

 If b does not represent a function, the behaviour of ap is unspecified.
 a must be an Apply of any value

 ap must apply the function in Apply b to the value in Apply a

 No parts of return value of that function should be checked.



 Applicative

 A value that implements the Applicative specification must also implement the Apply specification.

 v.ap(A.of(x => x)) is equivalent to v (identity)
 A.of(x).ap(A.of(f)) is equivalent to A.of(f(x)) (homomorphism)
 A.of(y).ap(u) is equivalent to u.ap(A.of(f => f(y))) (interchange)
 of method

 of :: Applicative f => a -> f a
 A value which has an Applicative must provide an of function on its type representative. The of function takes one argument:

 F.of(a)
 Given a value f, one can access its type representative via the constructor property:

 f.constructor.of(a)
 of must provide a value of the same Applicative

 No parts of a should be checked
 *
 */

import fl from 'fantasy-land';
import {Node as List} from '../Node';
import one from '../create/one';


function ofOne(item) {
	return one(item);
}

function ap(values) {
	return this.map(fn => values.map(fn));
}

// required on all instances for Applicative compat
List.prototype.of = List.prototype[fl.of] = ofOne;
List[fl.ap] = List.prototype.ap = List.prototype[fl.ap] = ap;


// List.prototype.ap = List.prototype[fl.ap] = function ap(other) {
// 	return this.map(f => other.map(x => f(x))).flatten()
// };