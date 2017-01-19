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

var RAL_LIST16 = range(16);
var RAL_LIST32 = range(32);
var RAL_LIST64 = range(64);
var ARRAY16 = aRange(16);
var ARRAY32 = aRange(32);
var ARRAY64 = aRange(64);
/**
 * test array of 32, as that's what our i
 */



suite
	.add('Array: update 16', function() {
		var ll = ARRAY16.slice();
		var n = rand(16);
		ll.splice(n, 1, n);
	})
	.add('RAL: update 16', function() {
		var n = rand(16);
		var ll = RAL_LIST16.set(n, n)
	})
	.add('Array: update 32', function() {
		var ll = ARRAY32.slice();
		var n = rand(32);
		ll.splice(n, 1, n);
	})
	.add('RAL: update 32', function() {
		var n = rand(32);
		var ll = RAL_LIST32.set(n, n)
	})
	.add('Array: update 64', function() {
		var ll = ARRAY64.slice();
		var n = rand(64);
		ll.splice(n, 1, n);
	})
	.add('RAL: update 64', function() {
		var n = rand(64);
		var ll = RAL_LIST64.set(n, n)
	})

;

runSuite(suite);
