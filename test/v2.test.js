import {empty, one} from '../src/v2/_constructors';
import {append} from '../src/v2/append';
import {prepend} from '../src/v2/prepend';
import nth from '../src/v2/nth';
import {expect} from 'chai';

describe("rrb with focus tests", function() {
	var depths = [32, 1024, 32768, 1048576,33554432, 1073741824]

	describe("basic construction tests", function() {
		var none;
		var uno;

		it('constructor tests', function() {
			none = empty();
			uno = one(10);
		});

		it('append 32 test', function() {
			var vec = empty();
			for (var i = 0; 32 > i; i++) {
				vec = append(i, vec);
			}
		});

		it('append 10 000 test', function() {
			var vec = empty();
			for (var i = 0; 10000 > i; i++) {
				vec = append(i, vec);
			}
		});

		it('append 100 000 test', function() {
			var vec = empty();
			for (var i = 0; 100000 > i; i++) {
				vec = append(i, vec);
			}
		});

		it('append 1 000 000 test', function() {
			var vec = empty();
			for (var i = 0; 1000000 > i; i++) {
				vec = append(i, vec);
			}
		});

		it.skip('append 1 000 000 native test', function() {
			var vec = [];
			for (var i = 0; 1000000 > i; i++) {
				vec.push(i);
			}
		});
	});

	describe('prepend tests', function() {
		var pvec = empty();
		var MAX = 10000;

		it('prepend 1 000 000 test', function() {
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

		it('prepend 1 000 000 ordering test', function() {
			for (var i = MAX; i--;) {
				expect(nth(i, pvec, 'missing')).to.equal(i);
			}
		});
	})

	describe('ordered get/set confirmation', function() {


		it('retrieves 10000 items in same order as inserted', function() {
			var MAX = 10000
			var vec = empty();

			for (var i = 0; MAX > i; i++) {
				vec = append(i, vec);
			}

			for (var i = 0; MAX > i; i++) {
				expect(nth(i, vec)).to.equal(i);
			}
		})
	})

})