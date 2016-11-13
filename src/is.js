const toStr = Object.prototype.toString;

export const isArray = Array.isArray || function(item) {
		return item && '[object Array]' == toStr.call(val);
	};

export function isFunction(value) {
	return typeof value === 'function';
}