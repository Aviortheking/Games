/* eslint-disable max-len */
import Collider from '.'
import type Vector2D from '../Vector2D'

export default class BoxCollider2D extends Collider<{
	center?: Vector2D
	scale?: Vector2D
}> {

	/**
	 *
	 * @returns [Vector2D, Vector2D, Vector2D, Vector2D] the four points of the box collider
	 */
	// eslint-disable-next-line complexity
	public pos(): [Vector2D, Vector2D, Vector2D, Vector2D] {
		return [
			this.component.calculatePositionFor('topLeft', true),
			this.component.calculatePositionFor('topRight', true),
			this.component.calculatePositionFor('bottomLeft', true),
			this.component.calculatePositionFor('bottomRight', true),
		]
	}
}
