import type Component2D from '../../Component2D'

export interface BaseParams {
	tags?: string | null | Array<string> | undefined
}

export default abstract class Collider<
// eslint-disable-next-line @typescript-eslint/ban-types
T extends {} | void = {} | void
> {
	/**
	 * Colliders will only collide with othe that have the same type (undefined is a type)
	 *
	 * if type is null it will collide with everything
	 */
	public get tags() : string | null | Array<string> | undefined {
		return this.params.tags
	}

	public set tags(value: string | null | Array<string> | undefined) {
		this.params.tags = value
	}


	public readonly params: T & BaseParams = {} as T & BaseParams

	public constructor(
		public component: Component2D,
		it: T & BaseParams | void
	) {
		if (it) {
			this.params = it
		}
	}
}
