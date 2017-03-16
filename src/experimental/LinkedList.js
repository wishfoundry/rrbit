
// common core for both forward and reverse iterating linked lists
function SingleLinkedList(data, len, next) {
	this.data = data;
	this.link = next;
	this.length = len;
}

function one(value) {
	return new SingleLinkedList(value, 1, null)
}

function reverseOne(value) {
	return new SingleLinkedList(value, -1, null)
}

function add(value, list) {
	var len = list.length < 0 ? list.length - 1 : list.length + 1
	return new SingleLinkedList(value, len, list)
}

function nth(i, list, notFound) {
	if (0 > i) //if negative
		i = i + list.length;

	if (i > list.length)
		return notFound;

	while (list) {
		if ((list.length -1) == i)
			return list.data;

		list = list.link;
	}

	return notFound;
}
// easy, drop the tail items until the length is n
function take(n, list) {
	while(list && list.length > n) {
		list = list.link;
	}
	return list
}

// harder, have to drop head by first walking back from end
function drop(n, list) {
	if (n >= list.length) return;
	var newLen = list.length - n;
	var temp = new Array(newLen);
	while(newLen) {
		temp[--i] = list.data;
		list = list.link
	}
	// for (var i = 0; newLen > i; i++) {
	// 	temp[i] = list.data;
	// 	list = list.link
	// }
	return fromArray(temp)
}

function fromArray(arr) {
	if (!arr.length) return;
	var list = one(arr[0]);
	for (var i = 1, l = arr.length; l > i; i++) {
		list = add(arr[i], list)
	}
	return list;
}
function toArray(list) {
	var i = 0;
	var arr = new Array(list.length);

	while (list) {
		arr[i++] = list.data;
		list = list.link;
	}
	return arr;
}

function toArrayReverse(list) {
	var i = list.length - 1;
	var arr = new Array(i);

	while (list) {
		arr[i--] = list.data;
		list = list.link;
	}
	return arr;
}


// module.exports = {
// 	one: one,
// 	add: add,
// 	nth: nth,
// 	take: take,
// 	drop: drop,
// 	toArray: toArray
// }

export {
	one,
	add,
	nth,
	take,
	drop,
	toArray
}