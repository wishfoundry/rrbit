import {expect} from 'chai';
import {
	curry,
	compose,
	always,
	apply,
	defaultTo,
	attr} from '../src/functional';

function double(n) {
	return n * 2
}

function inc(n) {
	return n + 1
}

function half(n) {
	return div(n, 2)
}

function div(a, b) {
	return a / b
}

function add(a, b) {
	return a + b;
}

describe("function composition tests", function() {

	describe("curry", function() {
		it('expect a function as first arg', () => {
			var add1 = curry(add)(1);

			expect(add1(1)).to.equal(2);
		});
	});

	describe('compose', function() {



		it('executes composed functions right-to-left', function() {

			var composed = compose(double, inc, half);  // composed(x) = dub(inc(half(x)))

			expect(composed(2)).to.equal(4); // if this gives 2.5 the order is wrong
		});

		it('may have an outermost function taking more than one argument', function() {

			var composed = compose(inc, div);  // composed(x, y) = x/y +1

			expect(composed(10, 2)).to.equal(6); // 10/2 +1 = 5+1 = 6
		});


		it('can compose one function to give just that function', function() {

			expect(compose(div)(20, 5)).to.equal(4);
		});

		it('gives an identity function when making a composition of zero functions', function() {
			var id = compose();

			expect(id(2)).to.equal(2);
		});
	});

	describe('attr', function() {
		it('can get a value from an object at the named key', function() {
			var getA = attr('A');

			expect( getA({A:'B'}) ).to.equal( 'B' );
		});

		it('can get the length of a string', function() {
			var getLength = attr('length');

			expect( getLength("hello") ).to.equal( 5 );
		});

		it('can get a numbered array element out', function() {
			var getLength = attr(0);

			expect( getLength(['a','b','c']) ).to.equal( 'a' );
		});
	});
});