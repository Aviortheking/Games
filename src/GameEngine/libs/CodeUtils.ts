/**
 * Allow to quickly apply elements to item through fn
 *
 * @param item the variable to apply childs
 * @param fn the function to run
 * @returns item with elements modified from fn
 */
export function apply<T>(item: T, fn: (this: T, item: T) => void): T {
	fn.call(item, item)
	return item
}
