import {Block16, Block8, Block4} from '../src/experimental/Block';
import {expect} from 'chai';

describe("collection tests", function() {
	var x4, x8, x16;

	it('ranges test', function() {
		x4 = Block4.times(i => i, 32);
		x8 = Block8.times(i => i, 32);
		x16 = Block16.times(i => i, 32);
	});

	it('sum test', function() {
		var sum4 = x4.reduceKV((v, i, sum) => sum + i, 0)
		expect(sum4).to.equal(496)

		var sum8 = x8.reduceKV((v, i, sum) => sum + i, 0)
		expect(sum8).to.equal(496)

		var sum16 = x16.reduceKV((v, i, sum) => sum + i, 0)
		expect(sum16).to.equal(496)

	})
})