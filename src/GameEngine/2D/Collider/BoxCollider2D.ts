import Collider from '.'
import Vector2D from '../Vector2D'

export default class BoxCollider2D extends Collider<{
	center?: Vector2D
	scale?: Vector2D
}> {

	/**
	 *
	 * @returns [Vector2D, Vector2D, Vector2D, Vector2D] the four points of the box collider
	 */
	public pos(): [Vector2D, Vector2D, Vector2D, Vector2D] {
		const middle = this.component.getAbsolutePosition(false).sum(this.component.scale.x / 2, this.component.scale.y / 2)
		const topLeft = this.applyRotation(this.component.getAbsolutePosition(false), middle, this.component.rotation)
		const topRight = this.applyRotation(topLeft.sum(this.component.scale.x, 0), middle, this.component.rotation)
		const bottomLeft = this.applyRotation(topLeft.sum(0, this.component.scale.y), middle, this.component.rotation)
		const bottomRight = this.applyRotation(topLeft.sum(this.component.scale), middle, this.component.rotation)

		return [
			topLeft,
			topRight,
			bottomLeft,
			bottomRight
		]
	}

	private applyRotation(point: Vector2D, middle: Vector2D, rotation: number) {
		if (rotation === 0) {
			return point.clone()
		}

		// FIXME: Fix rotation not returning the correct points for points other than topleft
		return point.clone()
		const rot = rotation * (Math.PI / 180)
		const tmp = point.clone().sum(-middle.x, -middle.y)
		return new Vector2D(
			middle.x + (tmp.x * Math.cos(rot) - tmp.y * Math.sin(rot)),
			middle.y + (tmp.x * Math.sin(rot) + tmp.y * Math.cos(rot))
		)
	}
}
