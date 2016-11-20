import {Node} from '../Node';

Node.one = one;

// performance shortcut for an array of one
export default function one(item) {
	return new Node(0, [ item ], void 0);
}