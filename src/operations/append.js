import {curry} from '../functional';
import {Node as List} from '../Node';
import {append as _append} from '../append';



List.prototype.append = function (a, b) {
	return _append(a, this);
};

const append = List.append = curry(_append);

export default append;
