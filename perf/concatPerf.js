var Benchmark = require('benchmark');
var Imm = require('immutable');
var seamless = require('seamless-immutable');
var mori = require('mori');
var iam = require('immutable-array-methods');
var List = require('../lib')
console.log(JSON.stringify(List));

var SML = times(64);
var MED = times(1024);
var LRG = times(100000);
// var LRG = times(64);

function times(size) {
	return new Array(size).map(function(v,i) { return i; })
}
var BASE = {
	'immutable': Imm.fromJS(LRG),
	'seamless': seamless.from(LRG),
	'mori': mori.toClj(LRG),
	'rrb': List.of(LRG)

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
	.add('rrb', function() {
		var list = List.append(BASE.rrb, BASE.rrb);
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
