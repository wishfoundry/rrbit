import {Node as List, isNode as isList} from './Node';

import './create/index';
import './operations/index';
import './fantasyland/index';
import './iterator/index';


// last minute addons
List.isList = isList;
List.prototype.toArray  = function() {
	return this.foldl(addTo, [], this);
};
function addTo(value, array) {
	array.push(value);
	return array;
}

export default List;


