import {Node as List, EMPTY, isNode} from '../Node';
import fromArray from './_fromArray';
import times from './times';

List.from = from;

/**
 * the default list constructor
 * accepts an single native array, varargs, or nothing(if an empty list is desired)
 *
 */
export default function from(iterable, mapFn) {
	var list = EMPTY;

	if (isNode(iterable)) {
		return iterable;
	}

	// use more performant, pre-allocation technique when possible
	if (Array.isArray(iterable)) {
		return !mapFn ? fromArray(iterable) : times((i) => mapFn(iterable[i], i), iterable.length);
	}

	// if length is unknown, just use slower push
	if (mapFn) {
		for (var item of iterable) {
			list = list.push(mapFn(item));
		}
	} else {
		for (var item of iterable) {
			list = list.push(item);
		}
	}

	return list;
}