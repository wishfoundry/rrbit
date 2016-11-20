/**
 *
 * Foldable

 u.reduce is equivalent to u.reduce((acc, x) => acc.concat([x]), []).reduce
 reduce method

 reduce :: Foldable f => f a ~> ((b, a) -> b, b) -> b
 A value which has a Foldable must provide a reduce method. The reduce method takes two arguments:

 u.reduce(f, x)
 f must be a binary function

 if f is not a function, the behaviour of reduce is unspecified.
 The first argument to f must be the same type as x.
 f must return a value of the same type as x.
 No parts of f's return value should be checked.
 x is the initial accumulator value for the reduction

 No parts of x should be checked.
 *
 */


