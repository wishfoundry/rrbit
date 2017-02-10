var Benchmark = require('benchmark');
var suite = Benchmark.Suite('push items to list performance');
require('babel-polyfill');
var runSuite = require('./runSuite');
var Block = require('../lib/block');

var Block4 = Block.Block4;
var Block8 = Block.Block8;
var Block16 = Block.Block16;


function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function rand(max) {
	return randomBetween(0, max)
}


var LIST4 = Block4.times(i => i, 32);
var LIST8 = Block8.times(i => i, 32);
var LIST16 = Block16.times(i => i, 32);
var ARRAY32 = Array.apply(0, Array(32)).map((_, i) => i)
/**
 * test array of 32, as that's what our i
 */



suite
	.add('Array: update 32', function() {
		var ll = ARRAY32.slice();
		var n = rand(32);
		ll.splice(n, 1, n);
	})
	.add('Block4: update ', function() {
		var n = rand(32);
		var ll = LIST4.update(n, n)
	})
	.add('Block8: update ', function() {
		var n = rand(32);
		var ll = LIST8.update(n, n)
	})
	.add('Block16: update ', function() {
		var n = rand(32);
		var ll = LIST16.update(n, n)
	})
	.add('Array: push 32', function() {
		var list = [];
		var i = 32;
		while (i--) {
			list = list.slice();
			list.push(i)
		}
	})
	.add('Array: push 16', function() {
		// check if two list of 16 are faster
		var list = [];
		var i = 16;
		while (i--) {
			list = list.slice();
			list.push(i)
		}
		i = 16;
		while (i--) {
			list = list.slice();
			list.push(i)
		}
	})
	.add('Block4: push 32', function() {
		var list = Block4.empty();
		var i = 32;
		while (i--)
			list = list.append(i);
	})
	.add('Block8: push 32', function() {
		var list = Block8.empty();
		var i = 32;
		while (i--) {
			list = list.append(i);
		}
	})
	.add('Block16: push 32', function() {
		var list = Block16.empty();
		var i = 16;
		while (i--)
			list = list.append(i);
	})


	// .add('Array: get 32', function() {
	// 	var x = ARRAY32[rand(32)]
	// })
	// .add('Block4: get 32', function() {
	// 	var x = LIST4.nth(rand(32))
	// })
	// .add('Block8: get 32', function() {
	// 	var x = LIST8.nth(rand(32))
	// })
	// .add('Block16: get 32', function() {
	// 	var x = LIST16.nth(rand(32))
	// })

;

runSuite(suite);
