// push items to list performance - 1k
// -------------------------------------------------------
// immutable-js              1831.85 op/s ±  1.89%   (86 samples)
// imm methods               1731.02 op/s ±  1.20%   (89 samples)
// native                  212030.06 op/s ±  1.26%   (90 samples)
// native slice() + push()   1052.16 op/s ±  1.05%   (84 samples)
// mori                     29585.35 op/s ±  1.12%   (90 samples)
// List                       433.04 op/s ±  1.03%   (87 samples)
// focusable(fast)          30351.12 op/s ±  1.25%   (89 samples)
// focusable                 3816.54 op/s ±  1.42%   (89 samples)
// _rrb                      2258.48 op/s ±  1.93%   (87 samples)
// -------------------------------------------------------


// push items to list performance - 10k
// -------------------------------------------------------
// immutable-js               192.50 op/s ±  1.35%   (78 samples)
// imm methods                 24.71 op/s ±  1.45%   (44 samples)
// native                   18556.40 op/s ±  1.48%   (86 samples)
// native slice()+push()       10.94 op/s ±  1.32%   (31 samples)
// mori                      2551.32 op/s ±  1.12%   (83 samples)
// List                        34.67 op/s ±  2.07%   (59 samples)
// focusable(fast)           1049.71 op/s ±  1.13%   (88 samples)
// focusable                  373.49 op/s ±  1.35%   (84 samples)
// _rrb                       151.19 op/s ±  1.08%   (75 samples)
// -------------------------------------------------------



// push items to list performance - 100k
// -------------------------------------------------------
// immutable-js                16.09 op/s ±  2.27%   (43 samples)
// imm methods                  0.08 op/s ±  9.86%    (5 samples)
// native                    1003.87 op/s ±  2.89%   (76 samples)
// native slice()+push()        0.02 op/s ±  5.09%    (5 samples)
// mori                       236.24 op/s ±  1.64%   (78 samples)
// List                         3.16 op/s ±  3.30%   (12 samples)
// focusable(fast)             93.93 op/s ±  3.94%   (68 samples)
// focusable                   30.17 op/s ±  3.88%   (53 samples)
// _rrb                        10.86 op/s ±  2.82%   (31 samples)
// -------------------------------------------------------


var Benchmark = require('benchmark');
var Imm = require('immutable');
var seamless = require('seamless-immutable');
var mori = require('mori');
var iam = require('immutable-array-methods');
var List = require('../lib');
var runSuite = require('./runSuite');
var rrb = require('../src/scrap/rrb');
var v2 = require('../lib/v2')




var SIZE = 1000;

var suite = Benchmark.Suite('push items to list performance');



suite
	.add("immutable-js", function() {
		var list = Imm.List();
		for (var i = 0; SIZE > i; i++) {
			list = list.push(i);
		}
	})
	// too slow to measure
	// .add('seamless-immutable', function() {
	// 	var list = seamless.from([1]);
	//
	// 	for (var i = 0; SIZE > i; i++) {
	// 		list = list.concat(1);
	// 	}
	// })
	.add('imm methods', function() {
		var list = [];
		for (var i = 0; SIZE > i; i++) {
			list = iam.push(list, i)
		}
	})
	.add('native ', function() {
		var list = [];
		for (var i = 0; SIZE > i; i++) {
			list.push(i);
		}
	})
	// .add('native prealloc', function() {
	// 	var list = new Array(SIZE);
	// 	for (var i = 0; SIZE > i; i++) {
	// 		list[i] = i;
	// 	}
	// })
	.add('native slice() + push() ', function() {
		var list = [];
		for (var i = 0; SIZE > i; i++) {
			list = list.slice(0);
			list.push(i);
		}
	})
	.add('mori', function() {
		var list = mori.list();
		for (var i = 0; SIZE > i; i++) {
			list = mori.conj(list, i);
		}
	})
	.add('List', function() {
		var list = List.empty();
		for (var i = 0; SIZE > i; i++) {
			list = List.push(i, list)
		}
	})
	.add('focusable(fast)', function() {
		//expected builder performance
		var list = v2.empty();
		for (var i = 0; SIZE > i; i++) {
			list = v2.appendǃ(i, list)
		}
	})
	.add('focusable', function() {
		var list = v2.empty();
		for (var i = 0; SIZE > i; i++) {
			list = v2.append(i, list)
		}
	})
	// .add('List range', function() {
	// 	var list = List.range(0, SIZE);
	// })
	// .add('List + native', function() {
	// 	var list = [];
	// 	for (var i = 0; SIZE > i; i++) {
	// 		list.push(i, list)
	// 	}
	// 	List.from(list)
	// })
	// .add('List Array() prealloc', function() {
	// 	var list = List.from(new Array(SIZE));
	// })
	.add('_rrb', function() {
		var list = rrb.empty();
		for (var i = 0; SIZE > i; i++) {
			list = rrb.push(i, list)
		}
	});



runSuite(suite);
