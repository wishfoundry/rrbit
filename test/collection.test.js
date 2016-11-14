import List from '../src/index';
import {expect} from 'chai';

describe("collection tests", function() {

	// a 1 indexed array
	var SIXTY_FOUR = [...(new Array(64)).keys()];

	it("dummy value test", function() {
		expect(SIXTY_FOUR.length).to.equal(64);
		expect(SIXTY_FOUR[0]).to.equal(0);
		expect(SIXTY_FOUR[32]).to.equal(32);
		expect(SIXTY_FOUR[64]).to.equal(undefined);

	});

	describe("can construct lists", function() {

		it("can construct empty lists", function() {
			expect(() => {
				var l = List.empty();
			}).to.not.throw();

		});

		it("can construct list using of()", function() {
			expect(() => {
				//
				var list = List.of(1, 2, 3, 4, 5);


			}).to.not.throw();
		});

		it("can construct list from a native array", function() {
			expect(() => {
				//
				var list = List.of([1, 2, 3, 4, 5]);


			}).to.not.throw();
		});

		it("can construct large lists", function() {
			// List trees segment internally every 32 item
			// we need to test if it works the same when sgemented

			var list;
			expect(() => {
				list = List.from(SIXTY_FOUR);

				expect(list.toArray()).to.eql(SIXTY_FOUR);
			}).to.not.throw();
		});

	});

	it("can convert from an array", function() {
		var list = List.from([1, 2, 3, 4]);

		var values = [];
		list.map(function(value, i) {
			values.push(value)

		}, list);

		expect(values).to.eql([1, 2, 3, 4]);

	});

	it("can convert to an array", function() {
		expect(List.of(1, 2, 3, 4, 5, 6).toArray()).to.eql([1, 2, 3, 4, 5, 6]);
	});

	it("can convert empty list to an array", function() {
		expect(List.empty().toArray()).to.eql([]);
	});

	it("can reverse the order of a list", function() {
		var list = List.of(1, 2, 3, 4, 5, 6);
		expect(list.reverse().toArray()).to.eql([6, 5, 4, 3, 2, 1])
	});

	it("can get by 0 index", function() {
		var list = List.of("a", "b", "c", "d");
		expect(list.get(0)).to.eql("a");
		expect(list.get(1)).to.eql("b");
		expect(list.get(2)).to.eql("c");
		expect(list.get(3)).to.eql("d");

		expect(List.get(0, list)).to.eql("a");
		expect(List.get(1, list)).to.eql("b");
		expect(List.get(2, list)).to.eql("c");
		expect(List.get(3, list)).to.eql("d");
	});

	it("can map over a list", function() {
		var list = List.of(1, 2, 3, 4, 5, 6);

		expect(List.map(v => v + "i", list).toArray()).to.eql(['1i', '2i', '3i', '4i', '5i', '6i']);
	});

	it("can use js iterators over the list", function() {
		var list = List.of(SIXTY_FOUR);
		var result = [];

		for (var value of list) {
			result.push(value);
		}

		expect(list.toArray()).to.eql(result);
	});

	it("can slice a list", function() {
		expect(List.of(1, 2, 3, 4, 5).slice(2).toArray()).to.eql([3, 4, 5])
	});

	it("can show length", function() {
		var list = List.of(1, 2, 3, 4, 5, 6);

		expect(list.length).to.equal(6);
		expect(list.size()).to.equal(6);
	});

	function pow(num, prev) {
		return Math.pow(num, prev)
	}

	function divide(num, prev) {
		return prev / num
	}

	describe('foldR', function() {

		it("can fold list where order doesnt matter", function() {
			function add(n, m) {
				return n + m;
			}

			var list = List.of(1, 2, 3, 4);
			var sum = List.foldr(add, 0, list);

			expect(sum).to.equal(1 + 2 + 3 + 4);
		});

		it("can fold list in the correct order", function() {
			function fn(name, param) {
				return name + '(' + param + ')'
			}

			// if order were wrong, might give c(b(a(x)))
			expect(List.foldr(fn, 'x', List.of('a', 'b', 'c'))).to.equal('a(b(c(x)))');
		});
	});

	describe('foldL', function() {

		it("can fold list where order doesnt matter", function() {
			function add(n, m) {
				return n + m;
			}

			var list = List.of(1, 2, 3, 4);
			var sum = List.foldl(add, 0, list);

			expect(sum).to.equal(1 + 2 + 3 + 4);
		});

		it("can fold list in the correct order", function() {
			function fn(name, param) {
				return name + '(' + param + ')'
			}

			expect(List.foldl(fn, 'x', List.of('a', 'b', 'c'))).to.equal('c(b(a(x)))');
		});
	});

	describe('slice', function() {
		var list = List.of(1,2,3,4,5,6,7,8,9,10);
		var big = List.from(SIXTY_FOUR);

		it("can slice lists", function() {
			var front = List.slice(0, 5, list);
			expect(front.length).to.equal(5);

			var back = List.slice(5, 10, list);
			expect(back.length).to.equal(5);
		});

		it("can slice large lists", function() {

			expect(big.length).to.equal(64);

			var forw = List.slice(0, big.length / 2, big);
			expect(forw.size()).to.equal(32, "fail");

			var aft = List.slice(big.length / 2, big);
			expect(aft.length).to.equal(32, "really fail");
		});

		it("can slice without a end arg", function() {
			var tail = List.slice(5, list);
			expect(tail.length).to.equal(5);
		});
	});

	describe('append two lists to each other', function() {
		var list = List.of(1,2,3,4,5,6,7,8,9,10);
		var big = List.of(...SIXTY_FOUR);

		it("can append to list together in correct order", function() {
			var joined = List.append(big, list);

			expect(joined.length).to.equal(74);

			expect(joined.get(73)).to.equal(10);
			expect(joined.get(64)).to.equal(1);
			expect(joined.get(54)).to.equal(54);
		});

		it("can prepend two lists to each other", function() {
			var joined = list.prepend(big);

			expect(joined.length).to.equal(74);

			expect(joined.get(73)).to.equal(10);
			expect(joined.get(64)).to.equal(1);
			expect(joined.get(54)).to.equal(54);
		});
	});
});