import {empty, one} from '../src/pure/_constructors';
import {append} from '../src/pure/append';
// import {appendǃ} from '../src/pure/_append';
import nth from '../src/pure/nth';
import {expect} from 'chai';

describe("rrb with focus tests", function() {
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

	describe('ordered get/set confirmation', function() {
		var depths = [32, 1024, 32768, 1048576,33554432, 1073741824]

		it('retrieves 1000 items in same order as inserted', function() {
			var MAX = 1000
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