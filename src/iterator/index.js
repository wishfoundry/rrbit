import {Node as List} from '../Node';
import iterator from './iterator';

const $$iter = (Symbol && Symbol.iterator) || "@@iterator";

List.prototype[$$iter] = function() {
	return iterator(this);
};