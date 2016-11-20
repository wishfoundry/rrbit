import times from './times';
import {Node as List} from '../Node';

List.range = range;

export default function range(from, to) {
	var len = to - from;
	return times((i) => from + i, len);
}