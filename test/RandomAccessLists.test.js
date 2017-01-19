import { expect } from 'chai';
// import 'babel-polyfill';

import List from '../src/SkewList';

function range(from, to) {
	var list = new List();
	while (to--) {
		list = list.unshift(i);
		if (to === from) return list;
	}
	return list;
}

describe("Random Access Lists", function() {

	it("basic sanity test", function() {
		var list = new List();
		list = list.unshift("a")
	});

	describe("ranges in order", function() {
		var list = new List();
		var iList = new List();

		it("can produce a range in order", function() {
			list = range(0, 10000);

			var i = 10000;
			while (i--) {
				iList = iList.unshift(i + "i");
			}
		});


		it("can get items in their order", function() {
			for (var i = 0; i < 10000; i++) {
				expect(list.nth(i)).to.equal(i)
			}

			for (var i = 0; i < 10000; i++) {
				expect(iList.nth(i)).to.equal(i + "i")
			}
		});

		it("can iterate in order", function() {
			var i = 0;
			for (var item of list) {
				expect(item).to.equal(i++)
			}
		});

		it("can iterate in  reverse order", function() {
			var i = 10000;
			for (var item of list.reverse()) {
				expect(item).to.equal(--i)
			}
		});

		it("can calc it's length", function() {
			expect(list.length).to.equal(10000)
		});
	});

	describe("mutation tests", function() {
		var list = range(0, 10);
		var list1k = range(0, 1000);
		var sf = new SForest();

		for (var i = 0; i < 10; i++) {
			sf = sf.cons(i);
		}

		it("is in order", function() {
			expect(list.get(0)).to.equal(0);
			expect(list.get(5)).to.equal(5);
			expect(list.get(9)).to.equal(9);
		});

		it("can minimally update", function() {
			var l = list.set(5, "tada!");
			expect(l.get(5)).to.equal("tada!");
		});

		it("support mapping", function() {
			var i = 0
				, list2 = list.map(i => i + "i");
			for(var item of list2) {
				expect(item).to.equal((i++) + "i")
			}
		});

		it("supports reducing", function() {
			var add = (a, b) => a + b;

			expect(list.reduce(add, 0)).to.equal(45);
			expect(list1k.reduce(add, 0)).to.equal(499500);
		})
	})

});