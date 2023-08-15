import Collider from '.'
import Vector2D from '../Vector2D'

export default class PointCollider2D extends Collider<{
	center?: Vector2D
	scale?: Vector2D
}> {

	/**
	 *
	 * @returns Vector2D the position of the point
	 */
	public pos(): Vector2D {
		return this.component.getAbsolutePosition()
	}
}
