
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

function anyDirToArray(list) {
	var len = Math.abs(list.length),
		out = new Array(len);
	while (list) {

	}
}


module.exports = {
	one: one,
	add: add,
	nth: nth,
}