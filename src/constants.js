

//private property names
const TABLE = Symbol('@@rrb/table');
const HEIGHT = Symbol('@@rrb/height');
const LENGTHS = Symbol('@@rrb/lengths');

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
const M = 32;
const E = 2;


export {
	TABLE,
	HEIGHT,
	LENGTHS,
	M,
	E
};

