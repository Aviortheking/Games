import Collider from '.'
import Vector2D from '../Vector2D'

export default class Circlecollider2D extends Collider<{
	radius?: number
	offset?: Vector2D
}> {

	public center(): Vector2D {
		return new Vector2D(0)
	}

	public radius(): number {
		return this.params.radius ?? 0
	}
}
