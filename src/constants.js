
// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
const M = 32;
const E = 2;


export {
	M,
	E
};

