import {λ} from 'fantasy-check'
import {describe, it} from 'mocha'
import {expect} from 'chai'
import assert from 'assert'
import * as Functor from 'fantasy-land/laws/functor'
import * as Chain from 'fantasy-land/laws/chain'
import * as Apply from 'fantasy-land/laws/apply'
import * as Applicative from 'fantasy-land/laws/applicative'
import * as Semigroup from 'fantasy-land/laws/semigroup'
import * as Monoid from 'fantasy-land/laws/monoid'
import fl from 'fantasy-land'
import List from '../src/index'

const id = x => x

export function assertSame (listA, ListB) {
	assert(listA.length == listB.length, "lists not same length");

	listA.map((item, i) =>
		assert.strictEqual(item, listB.get(i)));
}

describe("fantasy-land laws compliance", function() {

	describe('functor', () => {
		it('should satisfy identity', () => {
			return Functor.identity(List.of, assertSame, {})
		});

		it('should satisfy composition', () => {
			const f = x => x + 'f';
			const g = x => x + 'g';
			return Functor.composition(List.of, assertSame, f, g, 'x')
		});

		it('should be covered', () => {
			return List.of()[fl.map](id)
		});
	});

	describe('apply', () => {
		it('should satisfy composition', () => {
			return Apply.composition(List.of, assertSame, {})
		});

		it('should be covered', () => {
			return List.of()[fl.ap](List.of(id))
		})
	});

	describe('applicative', () => {
		it('should satisfy identity', () => {
			return Applicative.identity(List, assertSame, {})
		});

		it('should satisfy homomorphism', () => {
			return Applicative.homomorphism(List, assertSame, {})
		});

		it('should satisfy interchange', () => {
			return Applicative.interchange(List, assertSame, {})
		});

		it('should be covered', () => {
			var fn = List[fl.of];// << technically, it might be
			return List.of(undefined)
		});
	});

	describe('chain', () => {
		it('should satisfy associativity', () => {
			return Chain.associativity(List.of, assertSame, {})
		});

		it('should be covered', () => {
			return List.of()[fl.chain](List.of)
		});
	});

	describe('semigroup', () => {
		it('should satisfy associativity', () => {
			return Semigroup.associativity(List.of, assertSame, {})
		});

		it('should be covered', () => {
			return List.of()[fl.concat](List.of())
		});
	});

	describe('monoid', () => {
		it('should satisfy rightIdentity', () => {
			return Monoid.rightIdentity(List, assertSame, {})
		});

		it('should satisfy leftIdentity', () => {
			return Monoid.leftIdentity(List, assertSame, {})
		});

		it('should be covered', () => {
			var emt = List[fl.empty];
			return emt().concat(List.of())
		});
	})
});