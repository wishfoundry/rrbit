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

// proto.chain = proto.concatMap = function(f) {
// 	//note: this is single level concat, but most functional level concat
// 	// rules define this as fully recursive
// 	return foldr((value, acc) =>
// 		_concat(f(value), acc), EMPTY, this);
//
// 	// recursive concat ???
//
// 	// function _concat(list) {
// 	// 	if (list.length === 0)
// 	// 		return empty();
// 	// 	return list.head().concat(_concat(list.tail()));
// 	// }
// 	//
// 	// return _concat(this.map(f));
// };