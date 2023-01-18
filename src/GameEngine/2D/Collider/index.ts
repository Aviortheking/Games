import Component2D from 'GameEngine/Component2D'

export default abstract class Collider<
// eslint-disable-next-line @typescript-eslint/ban-types
T extends {} | void = {} | void
> {

	public component!: Component2D

	protected params: T = {} as T

	public constructor(it: T | void) {
		if (it) {
			this.params = it
		}
	}
}
