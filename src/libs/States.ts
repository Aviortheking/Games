import { isObject, objectClone, objectEqual } from '@dzeio/object-util'

type ChangeFn<T> = (props: T, oldProps: T) => void | Promise<void>

export default class States<T extends Record<string, any>> {
	private observers: Partial<Record<keyof T, Array<ChangeFn<Partial<T>>>>> = {}

	public props: T = {} as T

	public setProps(items: Partial<T>, options?: {
		force: boolean
	}) {
		const old = objectClone(this.props)
		let updated = false
		for (const item in items) {
			if (
				!options?.force &&
				((isObject(this.props[item]) && isObject(items[item]) && objectEqual(this.props[item] as object, items[item] as object)) ||
				this.props[item] === items[item])
			) {
				console.warn(item, 'does not need to be updated')
				continue
			}
			updated = true
			this.props[item] = items[item] as T[typeof item]
			const obs = this.observers[item]
			if (obs) {
				for (const observer of obs) {
					observer(this.props, old)
				}
			}
		}
		if (updated) {
			const obs = this.observers['']
			if (obs) {
				for (const observer of obs) {
					observer(this.props, old)
				}
			}
		}
	}

	public constructor(
		props: T
	) {
		this.setProps(props)
	}

	public forceUpdate(key: string) {
		const obs = this.observers[key]
		if (obs) {
			for (const observer of obs) {
				observer(this.props, this.props)
			}
		}
	}

	public onUpdate(fn: ChangeFn<Partial<T>>) {
		return this.listen('', fn)
	}

	public listen(key: keyof T | '', fn: ChangeFn<Partial<T>>) {
		if (!this.observers[key]) {
			this.observers[key] = []
		}
		this.observers[key]?.push(fn)
		if (typeof this.props[key] !== 'undefined') {
			fn(this.props, this.props)
		}
	}
}
