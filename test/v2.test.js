import {empty, one} from '../src/v2/_constructors';
import {append} from '../src/v2/append';
import {prepend} from '../src/v2/prepend';
import nth from '../src/v2/nth';
import concat from '../src/v2/appendAll';
import {expect} from 'chai';

var DEPTHS = [
	32, // 0 depth (leaf only)
	1024, // 1 depth (default min depth)
	32768, // 2 depth
	1048576, // 3 depth (1M)
	33554432, // 4 depth (33.5M)
	1073741824 // 5 depth (1B) usually will cause out-of-memory by this point in current JS engines
]

function chunk(str, size) {
	var len = str.length,
		chunks = []
	for (var i = 0, len = str.length; len > i; i += size) {
		chunks.push(str.substring(i, i + size));
	}
	return chunks;
}

function pretty(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function range(from, to) {
	var len = to - from;
	var vec = empty();

	for (var i = 0; len > i; i++) {
		vec = append(i + from, vec);
	}

	return vec;
}

describe("rrb with focus tests", function() {

	describe.skip("basic construction tests", function() {
		var none;
		var uno;

		it('constructor tests', function() {
			none = empty();
			uno = one(10);
		});

		function testSize(MAX, timeout) {
			it(`append ${pretty(MAX)} test`, function() {
				this.timeout(timeout || 2000)
				var vec = empty();
				for (var i = 0; MAX > i; i++) {
					vec = append(i, vec);
				}
			});
		}

		for (var MAX of [32, 1024, 32768, 1048576]) {
			testSize(MAX, 1000)
		}

		// testSize(33554432, 4000);
		// testSize(1073741824, 4000);

		it.skip('append 1,000,000 native test', function() {
			var vec = [];
			for (var i = 0; 1000000 > i; i++) {
				vec.push(i);
			}
		});
	});

	describe.skip('prepend tests', function() {
		var pvec = empty();
		// var MAX = 10000;
		var MAX = 100;

		it(`prepend ${pretty(MAX)} test`, function() {
			//*
			for (var i = 0; MAX > i; i++) {
				pvec = prepend(i, pvec);
			}
			/*/
			 try {
				 for (var i = 0; MAX > i; i++) {
					 pvec = prepend(i, pvec);
				 }
			 } catch (e) {
				 throw new Error(JSON.stringify(pvec))
			 }
			//*/

		});

		it(`prepend ${pretty(MAX)} ordering test`, function() {
			for (var i = MAX; i--;) {
				expect(nth(i, pvec, 'missing')).to.equal(i);
			}
		});

		it.skip('prepend 1,000,000 native test', function() {
			this.timeout(5000)
			// var MAX = 1000000;// stop-the-world sec
			var MAX = 500000; // 2.8 sec
			// var MAX = 100000; // 2.8 sec
			// var MAX = 10000;  // 13 msec
			// var MAX = 1000;   // 0.13 sec
			var vec = [];
			for (var i = 0; MAX > i; i++) {
				vec.unshift(i);
			}
		});
	})

	describe.skip('ordered get/set confirmation', function() {

		it('retrieves 10000 items in same order as inserted', function() {
			var MAX = 10000
			var vec = empty();

			for (var i = 0; MAX > i; i++) {
				vec = append(i, vec);
			}

			for (var i = 0; MAX > i; i++) {
				expect(nth(i, vec)).to.equal(i);
			}
			expect(vec.endIndex).to.equal(MAX)
		})
	})

	describe('concat tests', function() {

		it('joins two lists of 32 together', function() {
			var vec = empty();

			for (var i = 0; 33 > i; i++) {
				vec = append(i, vec);
			}

			var joined = concat(vec, vec);
			expect(joined.endIndex).to.equal(66)

			for (var i = 0; 33 > i; i++) {
				expect(nth(i, joined)).to.equal(i);
				//expect(nth(i + 33, vec)).to.equal(i);
			}
		})

		// it('joins two lists of 1000 together', function() {
		// 	var vec = range(0, 1000)
		//
		// 	var joined = concat(vec, vec);
		// 	expect(joined.endIndex).to.equal(2000)
		// })
	})

})