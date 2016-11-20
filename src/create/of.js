import fromArray from './_fromArray';
import {Node as List, EMPTY} from '../Node';
import one from './one';

List.of = of;

export default function of(first, ...rest) {

	if (typeof first === 'undefined')
		return EMPTY;

	if (rest && rest.length > 0)
		return fromArray([first].concat(rest));

	return one(first);
}