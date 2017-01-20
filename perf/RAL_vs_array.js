var Benchmark = require('benchmark');
var suite = Benchmark.Suite('push items to list performance');
require('babel-polyfill');
var runSuite = require('./runSuite');
var List = require('../lib/ral').default;


function objLookup(obj) {
	for (var i = 0; 16 > i; i++) {
		var x = obj[i] + obj[i] + obj[i] + obj[i] + obj[i]
	}
}
function randomBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function rand(max) {
	return randomBetween(0, max)
}


function range(max) {
	var i = 0,
		list = List();

	while (max > i) {
		list = list.unshift(i++);
	}
	return list;
}

function aRange(len) {
	return new Array(len).map((v, i) => i);
}


var RAL_LIST32 = range(32);
var ARRAY32 = aRange(32);
/**
 * test array of 32, as that's what our i
 */



suite
	.add('Array: update 32', function() {
		var ll = ARRAY32.slice();
		var n = rand(32);
		ll.splice(n, 1, n);
	})
	.add('RAL: update 32', function() {
		var n = rand(32);
		var ll = RAL_LIST32.set(n, n)
	})
	.add('Array: push 32', function() {
		var list = [];
		var i = 32;
		while (i--) {
			list = list.slice();
			list.push(i)
		}
	})
	.add('RAL: push 32', function() {
		var list = List();
		var i = 32;
		while (i--)
			list = list.unshift(i);
	})
	.add('Array: get 32', function() {
		var x = ARRAY32[rand(32)]
	})
	.add('RAL: get 32', function() {
		var x = RAL_LIST32.nth(rand(32))
	})

;

runSuite(suite);
