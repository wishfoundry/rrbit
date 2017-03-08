/**
 *
 * @param src
 * @param srcPos
 * @param dest
 * @param destPos
 * @param length
 */
export function arraycopy(src, srcPos, dest, destPos, length) {
	var i = 0
	while (i < length) {
		dest[i+destPos] = src[i+srcPos]
		i += 1
	}
	return dest;
}

// Java-like System.arraycopy
// we can remove this for the more performing one above once we're certain we've no weird
// usages with negative indices
export function _arraycopy(src, srcPos, dest, destPos, length) {
	var srcLen = src.length;
	var destLen = dest.length;
	if (srcPos < 0 || destPos < 0 || length < 0 || srcPos > srcLen - length || destPos > destLen - length) {
		//
		return null;
	}

	//do forward iteration
	if ((src !== dest) || destPos < srcPos || srcPos + length < destPos) {
		var i = 0
		while (i < length) {
			dest[i+destPos] = src[i+srcPos]
			i += 1
		}
		return dest;
	}

	// one of our positions is effectively a negative number
	// do reverse iteration

	var i = length - 1
	while (i >= 0) {
		dest[i + destPos] = src[i + srcPos]
		i -= 1
	}

	return dest;
}

// slice and leave on extra space at the front
export function sliceAndShift(start, end, arr, xtra/*number*/) {
	xtra = xtra || 1;
	var copy = new Array(end + xtra);
	for (var i = start; end > i; i++) {
		copy[i + xtra] = arr[i]
	}
	return copy;
}
// slice and leave one extra space at the end
export function sliceAndPush(start, end, arr, xtra/*number*/) {
	var copy = new Array(end + (xtra || 1));
	for (var i = start; end > i; i++) {
		copy[i] = arr[i]
	}
	return copy;
}

export function aSetǃ(i, val, array) {
	array[i] = val;
	return array;
}

export function aSet(i, val, array) {
	var copy = array.slice(0)
	copy[i] = val;
	return copy;
}

/*
 * we frequently want to clone an array, but off by one to either
 * safely append to the end or the beginning. doing this in one operation
 * instead of slice() and unshift() is much more efficient
 */
export function copyOf(array, numElements, newSize) {
	var newArray = new Array(newSize);
	for (var i = 0; numElements > i; i++) {
		newArray[i] = array[i];
	}
	return newArray;
}

export function push(value, src) {
	var arr = src.slice(0);
	arr[arr.length] = value;
	return arr;
}

// safe & performant prepend  to end(returns new array
export function unshift(value, src) {
	var len = src.length + 1
	var items = new Array(len);
	items[0] = value;
	for (var i = 1; len > i; i++) {
		items[i] = src[i - 1];
	}
	return items;
}

export function last(arr) {
	return arr[arr.length - 1];
}

// int arrays do not allow nulls(that is to say null is always 0)
export function makeIntArray(length) {
	var ints = new Array(length);
	for (var i = 0; length > i; i++) {
		ints[i] = 0
	}
	return ints;
}
// int arrays must not return null
export function aIntGet(i, arr) {
	return arr[i] || 0
}