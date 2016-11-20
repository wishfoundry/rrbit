import {tableOf, isLeaf} from '../accessors';


export default function* reverse() {
	var table = tableOf(this);
	var i = table.length;
	if (isLeaf(this)) {
		while(i--) {
			yield table[i];
		}
	} else {
		while(i--) {
			yield * table[i];
		}
	}
}