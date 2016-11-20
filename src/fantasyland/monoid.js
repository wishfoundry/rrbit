/**
 *
 * Monoid

 A value that implements the Monoid specification must also implement the Semigroup specification.

 m.concat(M.empty()) is equivalent to m (right identity)
 M.empty().concat(m) is equivalent to m (left identity)
 empty method

 empty :: Monoid m => () -> m
 A value which has a Monoid must provide an empty function on its type representative:

 M.empty()
 Given a value m, one can access its type representative via the constructor property:

 m.constructor.empty()
 empty must return a value of the same Monoid

 */