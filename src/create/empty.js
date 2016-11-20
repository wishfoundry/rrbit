import {Node as List, EMPTY} from '../Node';


List.prototype.empty = empty;

List.empty = empty;

export default function empty() {
	return EMPTY;
}