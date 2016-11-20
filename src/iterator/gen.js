import {tableOf} from '../accessors';


export default function* forward() {
	if (isLeaf(this)) {
		for (var value of tableOf(this)) {
			yield value;
		}
	} else {
		for (var subTable of tableOf(this)) {
			yield * subTable;
		}
	}
}