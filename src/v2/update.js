import {fromFocusOf} from './_constructors';
import {normalizeAndFocusOnǃ, makeTransientIfNeeded} from './_vectorPointer';
import {aSet} from './_array'

/**
 *
 * @param {number} i
 * @param {T} value
 * @param {Node<T>} rrb
 * @param {*} notFound
 * @return {Node<T>|notFound}
 */
export function update(i, value, rrb, notFound) {
	var vec = fromFocusOf(rrb);
	vec.transient = rrb.transient;
	vec.endIndex = rrb.endIndex;

	if (i < rrb.focusStart || rrb.focusEnd <= i || ((i - rrb.focusStart) & ~31) != (rrb.focus & ~31)) {
		if (i < 0 || endIndex <= i)
			return notFound;

		normalizeAndFocusOnǃ(i, vec)
	}
	makeTransientIfNeeded(vec);
	vec.display0 = aSet((i - vec.focusStart) & 31, value, vec.display0);
	return vec;
}