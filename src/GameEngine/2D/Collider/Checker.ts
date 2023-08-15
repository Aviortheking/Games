import Collider from '.'
import GameEngine from '../..'
import ComponentRenderer from '../../Components/ComponentRenderer'
import CircleRenderer from '../../Renderer/CircleRenderer'
import MathUtils from '../../libs/MathUtils'
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
		const closestX = MathUtils.clamp(center.x, topLeft.x, bottomRight.x)
		const closestY = MathUtils.clamp(center.y, topLeft.y, bottomRight.y)

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

	/**
	 * check if a point collider with a rectangle (can handle rotated rectangles)
	 * @param pointCollider the point collider
	 * @param boxCollider the box collider
	 * @returns if the boxes collide
	 */
	public static pointBoxCollision(pointCollider: PointCollider2D, boxCollider: BoxCollider2D) {
		const point = pointCollider.pos()
			.rotate(boxCollider.component.getMiddle(true), -boxCollider.component.getAbsoluteRotation())
		const [topLeftRotated, , , bottomRightRotated ] = boxCollider.pos()
		const topLeft = topLeftRotated
			.rotate(boxCollider.component.getMiddle(true), -boxCollider.component.getAbsoluteRotation())
		const bottomRight = bottomRightRotated
			.rotate(boxCollider.component.getMiddle(true), -boxCollider.component.getAbsoluteRotation())

		return point
			.isIn(topLeft, bottomRight)
	}

	/**
	 * dumb way to check currntly
	 *
	 * TODO: Handle rotation
	 */
	public static boxBoxCollision(box1: BoxCollider2D, box2: BoxCollider2D): boolean {
		return this.rectangleRectangleCollisionV2(box1, box2)
	}

	public static posBoxBoxCollision(box1: [Vector2D, Vector2D], box2: [Vector2D, Vector2D]) {
		return box1[1].x > box2[0].x && // self bottom higher than other top
		box1[0].x < box2[1].x &&
		box1[1].y > box2[0].y &&
		box1[0].y < box2[1].y
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

	public static rectangleRectangleCollisionV2(box1: BoxCollider2D, box2: BoxCollider2D) {
		const rect1 = box1.pos()
		const rect2 = box2.pos()

		for (let i = 0; i < 4; i++) {
			const p1 = rect1[i]
			const p2 = rect1[(i + 1) % 4]

			for (let j = 0; j < 4; j++) {
				const p3 = rect2[j]
				const p4 = rect2[(j + 1) % 4]

				if (this.lineLineCollision([p1, p2], [p3, p4])) {
					return true
				}
			}
		}


		return false
	}

	/**
	 * I don't understand this shit (from god)
	*/
	// eslint-disable-next-line complexity
	private static lineLineCollision([a, b]: [Vector2D, Vector2D], [c, d]: [Vector2D, Vector2D]) {
		const den = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y)
		const num1 = (d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)
		const num2 = (b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)

		if (den === 0) {
			return num1 === 0 && num2 === 0
		}

		const r = num1 / den
		const s = num2 / den

		return r >= 0 && r <= 1 && s >= 0 && s <= 1
	}


}
