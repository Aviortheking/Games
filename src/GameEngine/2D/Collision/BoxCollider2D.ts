import GameEngine from 'GameEngine'
import Component2D from 'GameEngine/Component2D'
import Vector2D from '../Vector2D'

type BuiltinCollisionTypes = 'click' | 'pointerDown' | 'pointerUp'

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
		const positionCenter = GameEngine.getGameEngine().currentScene?.position.sum(this.component.origin.sub(
			new Vector2D(
				this.component.position.x,
				this.component.position.y
			)
		)) ?? this.component.origin.sub(
			new Vector2D(
				this.component.position.x,
				this.component.position.y
			)
		)

		const center = this.center.sum(positionCenter)
		return [new Vector2D(
			center.x,
			center.y
		),
		new Vector2D(
			center.x + scale.x,
			center.y + scale.y
		)]
	}

	public collideWith(collider: BoxCollider2D) {
		const selfPos = this.pos()
		const otherPos = collider.pos()

		return selfPos[1].x >= otherPos[0].x && // self bottom higher than other top
		selfPos[0].x <= otherPos[1].x &&
		selfPos[1].y >= otherPos[0].y &&
		selfPos[0].y <= otherPos[1].y
	}
}
