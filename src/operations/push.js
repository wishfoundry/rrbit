import {push as _push} from '../internal';
import {curry} from '../functional';
import {Node as List} from '../Node';


List.prototype.push = function(item) {
	return _push(item, this);
};

const push = List.push = curry(_push);

export default push;