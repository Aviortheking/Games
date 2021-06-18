import Component2D from 'GameEngine/Component2D'
import Vector2D from '../Vector2D'

type BuiltinCollisionTypes = 'click'

export default class BoxCollider2D {
	public constructor(
		private component: Component2D,
		public type: BuiltinCollisionTypes | string = 'collision',
		private center = new Vector2D(0, 0),
		private scale = new Vector2D(1, 1)
	) {}

	public pointColliding(point: Vector2D, type: BuiltinCollisionTypes | string = 'collision'): boolean {
		if (this.type !== type) {
			return false
		}
		return point.isIn(
			...this.pos()
		)
	}

	public pos(): [Vector2D, Vector2D] {
		const scale = this.scale.multiply(this.component.scale)
		const positionCenter = this.component.origin.sub(
			new Vector2D(
				this.component.position.x,
				this.component.position.y
			)
		)

		const center = this.center.sum(positionCenter)
		return [new Vector2D(
			center.x - scale.x / 2,
			center.y - scale.y / 2
		),
		new Vector2D(
			center.x + scale.x / 2,
			center.y + scale.y / 2
		)]
	}
}
