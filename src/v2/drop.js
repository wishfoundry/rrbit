import {fromFocusOf, empty} from './_constructors';
import {focusOnǃ, withComputedSizes, normalize, stabilizeDisplayPath} from './_vectorPointer';
import {last, arraycopy} from './_array';


/**
 * @typedef Node
 * @property {number} endIndex
 * @property {number} depth
 * @property {Array} display0
 * @property {Array} display1
 * @property {Array} display2
 * @property {Array} display3
 * @property {Array} display4
 * @property {Array} display5
 * @property {boolean} transient
 * @property {number} focus
 * @property {number} focusStart
 * @property {number} focusEnd
 * @property {number} focusDepth
 * @property {number} focusRelax
 *
 */

/**
 * drop first n items keeping the tail
 *
 * @param {number} n
 * @param {Node} rrb
 * @return {Node}
 */
export function drop(n, rrb) {
	if (n <= 0)
		return rrb;

	if (n >= rrb.endIndex)
		return empty() //todo: setup injector for this

	if (rrb.transient) {
		normalize(rrb.depth, rrb);
		rrb.transient = false
	}

	var vec = fromFocusOf(rrb);
	vec.endIndex = rrb.endIndex - n;
	if (vec.depth > 1) {
		focusOnǃ(n, vec)
		var cutIndex = vec.focus | vec.focusRelax;
		var d0Start = cutIndex & 31;
		if (d0Start != 0) {
			var d0len = vec.display0.length - d0Start
			vec.display0 = arraycopy(vec.display0, d0Start, new Array(d0len), 0, d0len)
		}

		cleanTopDrop(cutIndex, vec);
		if (vec.depth > 1) {
			var i = 2;
			var display = vec.display1;
			while (i <= vec.depth) {
				var splitStart = (cutIndex >> (5 * (i - 1))) & 31;
				var newLen = display.length - splitStart - 1;
				var newDisplay = arraycopy(display, splitStart + 1, new Array(newLen + 1), 1, newLen - 1);

				if (i > 1) {
					newDisplay[0] = vec['display' + (i - 2)];
					vec['display' + (i - 1)] = withComputedSizes(newDisplay, i)
					if (display < 6)
						display = vec['display' + i]
				}

				i += 1
			}
		}

		vec.focusEnd = vec.display0.length;
	} else {
		var newLen = vec.display0.length - n;
		vec.focusEnd = newLen;
		vec.display0 = arraycopy(vec.display0, n, new Array(newLen), 0, newLen);
	}

	vec.focus = 0;
	vec.focusStart = 0;
	vec.focusDepth = 1;
	vec.focusRelax = 0;
	return vec
}


// adjust focus and depth to match new length
function  cleanTopDrop(cutIndex, rrb) {
	var newDepth = 0;

	var nulled = null;
	// var nulled = []; //in theory, null should work ¯\_(ツ)_/¯

	var {
		depth,
		//display0,
		display1,
		display2,
		display3,
		display4,
		display5 } = rrb;

	if (depth == 1)
		return;

	if (depth < 6 || (cutIndex >> 25) == display5.length - 2) {
		rrb.display5 = nulled
		if (depth < 5 || (cutIndex >> 20) == display4.length - 2) {
			rrb.display4 = nulled
			if (depth < 4 || (cutIndex >> 15) == display3.length - 2) {
				rrb.display3 = nulled
				if (depth < 3 || (cutIndex >> 10) == display2.length - 2) {
					rrb.display2 = nulled
					if ((cutIndex >> 5) == display1.length - 2) {
						rrb.display1 = nulled
						newDepth = 1
					} else
						newDepth = 2
				} else
					newDepth = 3
			} else
				newDepth = 4
		} else
			newDepth = 5
	} else
		newDepth = 6

	rrb.depth = newDepth;
}