// appending two lists performance - 100000
// -------------------------------------------------------
// 	immutable-js           39.05 op/s ±  1.43%   (51 samples)
// seamless-immutable      13.68 op/s ±  3.54%   (38 samples)
// native concat         1099.11 op/s ±  7.06%   (72 samples)
// native push            228.72 op/s ±  6.64%   (75 samples)
// mori              18741394.72 op/s ±  1.01%   (90 samples)
// v1                  199971.94 op/s ±  0.90%   (91 samples)
// v2(focus)            35464.07 op/s ±  2.80%   (88 samples)
// -------------------------------------------------------


var Benchmark = require('benchmark');
var Imm = require('immutable');
var seamless = require('seamless-immutable');
var mori = require('mori');
var iam = require('immutable-array-methods');
var List = require('../lib')
var v2 = require('../lib/v2')


var SML = times(64);
var MED = times(1024);
var LRG = times(100000);
// var LRG = times(64);

function times(size) {
	return new Array(size).map(function(v,i) { return i; })
}
function range(size) {
	var vec = v2.empty();

	for (var i = 0; size > i; i++) {
		vec = v2.append(i, vec);
	}
	return vec;
}
var BASE = {
	'immutable': Imm.fromJS(LRG),
	'seamless': seamless.from(LRG),
	'mori': mori.toClj(LRG),
	'rrb': List.from(LRG),
	'v2': range(LRG.length)

}

function padl(n, s) {
	while(s.length < n) {
		s += ' ';
	}
	return s;
}
function padr(n, s) { while (s.length < n) { s = ' ' + s; } return s;}

var suite = Benchmark.Suite('appending two lists performance');




suite
	.add("immutable-js", function() {
		var list = BASE.immutable.concat(BASE.immutable)
	})
	.add('seamless-immutable', function() {
		var list = BASE.seamless.concat(BASE.seamless)
	})
	.add('native concat', function() {
		var list = LRG.concat(LRG);
	})
	.add('native push', function() {
		var list = LRG.slice(0);
		for (var i = 0, len = LRG.length; len > i; i++) {
			list.push(LRG[i])
		}
	})
	.add('mori', function() {
		var list = mori.concat(BASE.mori, BASE.mori)
	})
	.add('v1', function() {
		var list = List.append(BASE.rrb, BASE.rrb);
	})
	.add('v2', function() {
		var list = v2.appendAll(BASE.v2, BASE.v2);
	});


function runSuite(suite) {
	return suite
		.on('start', function() {
			console.log(this.name);
			console.log('-------------------------------------------------------');
		})
		.on('cycle', function logResults(e) {
			var t = e.target;


			if(t.failure) {
				console.error(padl(10, t.name) + 'FAILED: ' + e.target.failure);
			} else {
				var result = padl(18, t.name)
					+ padr(13, t.hz.toFixed(2) + ' op/s')
					+ ' \xb1' + padr(7, t.stats.rme.toFixed(2) + '%')
					+ padr(15, ' (' + t.stats.sample.length + ' samples)');

				console.log(result);
			}
		})
		.on('complete', function() {
			console.log('-------------------------------------------------------');
		})
		.run();
}

runSuite(suite);
