/**
 *
 *
 */





// List.prototype.traverse = function(point, fn) {
// 	return this.reduce((ys, x) =>
// 		fn(x).map(x => y => y.concat([x])).ap(ys), point(empty()))
// };
//
// List.prototype.traverse = function(f, of) {
// 	return this.map(f).sequence(of);
// };
// List.prototype.sequence = function(of) {
// 	return this.foldr(function(m, ma) {
// 		return m.chain(function(x) {
// 			if (ma.value.length === 0) return List.pure(x);
// 			return ma.chain(function(xs) {
// 				return List.pure(List.of(x).concat(xs));
// 			});
// 		})
// 	}, new List([[]]));
// };