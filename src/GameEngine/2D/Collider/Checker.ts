import Collider from '.'
import Vector2D from '../Vector2D'
import BoxCollider2D from './BoxCollider2D'
import Circlecollider2D from './CircleCollider2D'
import PointCollider2D from './PointCollider2D'

export default class Checker {
	public static boxCircleCollision(box: BoxCollider2D, circle: Circlecollider2D): boolean {
		// clamp(value, min, max) - limits value to the range min..max

		// Find the closest point to the circle within the rectangle
		const [topLeft, bottomRight] = box.pos()
		const center = circle.center()
		const radius = circle.radius()
		const closestX = this.clamp(center.x, topLeft.x, bottomRight.x)
		const closestY = this.clamp(center.y, topLeft.y, bottomRight.y)

		// Calculate the distance between the circle's center and this closest point
		const distanceX = center.x - closestX
		const distanceY = center.y - closestY

		// If the distance is less than the circle's radius, an intersection occurs
		const distanceSquared = distanceX * distanceX + distanceY * distanceY
		return distanceSquared < radius * radius
	}

	public static circleCircleCollision(circle1: Circlecollider2D, circle2: Circlecollider2D) {
		return false
	}

	public static pointBoxCollision(box1: PointCollider2D, box2: BoxCollider2D) {
		const [topLeft, , , bottomRight] = box2.pos()
		return box1.pos().isIn(topLeft, bottomRight)
	}

	/**
	 * dumb way to check currntly
	 *
	 * TODO: Handle rotation
	 */
	public static boxBoxCollision(box1: BoxCollider2D, box2: BoxCollider2D): boolean {

		const selfPos = box1.pos()
		const otherPos = box2.pos()

		return selfPos[3].x >= otherPos[0].x && // self bottom higher than other top
		selfPos[0].x <= otherPos[3].x &&
		selfPos[3].y >= otherPos[0].y &&
		selfPos[0].y <= otherPos[3].y

		// const b1 = box1.pos()
		// const b2 = box2.pos()
		// for (const box1It of b1) {
		// 	if (this.pointInRectangle(box1It, b2)) {
		// 		return true
		// 	}
		// }

		// return false
	}

	// eslint-disable-next-line complexity
	public static detectCollision(collider1: Collider, collider2: Collider, reverse = false): boolean {
		if (collider1 instanceof BoxCollider2D && collider2 instanceof Circlecollider2D) {
			return this.boxCircleCollision(collider1, collider2)
		} else if (collider1 instanceof Circlecollider2D && collider2 instanceof Circlecollider2D) {
			return this.circleCircleCollision(collider2, collider1)
		} else if (collider1 instanceof BoxCollider2D && collider2 instanceof BoxCollider2D) {
			return this.boxBoxCollision(collider2, collider1)
		} else if (collider1 instanceof BoxCollider2D && collider2 instanceof PointCollider2D) {
			return this.pointBoxCollision(collider2, collider1)
		}

		if (!reverse) {
			return this.detectCollision(collider2, collider1, true)
		}

		return false
	}

	private static clamp(value: number, min: number, max: number) {
		return min > value ? min : max < value ? max : value
	}

	/**
	 * FIXME: does not work perfecly
	 *
	 * @param point the point to check
	 * @param rectangle the rectangle in which to check
	 * @returns if the point is in the defined rectangle or not
	 */
	private static pointInRectangle(point: Vector2D, rectangle: [Vector2D, Vector2D, Vector2D, Vector2D]) {
		const ab = rectangle[1].sum(-rectangle[0].x, -rectangle[0].y)
		const ad = rectangle[3].sum(-rectangle[0].x, -rectangle[0].y)
		const am = point.sum(-rectangle[0].x, -rectangle[0].y)

		const abam = ab.x * am.x + ab.y * am.y
		const abab = ab.x * ab.x + ab.y * ab.y
		const amad = am.x * ad.x + am.y * ad.y
		const adad = ad.x * ad.x + ad.y * ad.y

		return 0 <= abam && abam <= abab &&
			0 <= amad && amad <= adad
	}
}
