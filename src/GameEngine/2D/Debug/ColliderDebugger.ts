import Component2D, { ComponentState } from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import BoxCollider2D from '../Collision/BoxCollider2D'
import Vector2D from '../Vector2D'

export default class ColliderDebugger extends Component2D {
	public readonly name = 'ColliderDebugger'
	public constructor(component: Component2D, collider: BoxCollider2D) {
		super()
		this.collider = collider
		const [topLeft, bottomRight] = collider.pos()
		const size = topLeft.sub(bottomRight)
		this.position = topLeft
		this.scale = size
		this.origin = new Vector2D(-(this.scale.x / 2), -(this.scale.y / 2))
		this.renderer = new RectRenderer(this, {stroke: 'black'})
	}

	public update(state: ComponentState) {
		if (state.isColliding) {
			(this.renderer as RectRenderer).material = 'rgba(0, 255, 0, .7)'
		} else {
			(this.renderer as RectRenderer).material = undefined
		}
	}
}
