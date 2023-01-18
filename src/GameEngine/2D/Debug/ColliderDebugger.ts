import Component2D, { ComponentState } from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import Vector2D from '../Vector2D'

export default class ColliderDebugger extends Component2D<{collision?: Array<string>}> {

	public readonly name = 'ColliderDebugger'

	public renderer: RectRenderer = new RectRenderer(this, {stroke: 'transparent'})

	public init() {
		if (!this.parent) {
			console.error('cant setup, no parent')
			return
		}
		this.collider = this.parent.collider
		this.position = new Vector2D(0)
		this.scale = this.parent.scale
		this.origin = this.parent.origin
	}

	public update(state: ComponentState) {
		if (state.collideWith?.filter((it) => !this.params.collision ? true : this.params.collision.includes(it.name)).length ?? 0 > 1) {
			this.renderer.material = 'rgba(0, 255, 0, .7)'
		} else {
			this.renderer.material = undefined
		}
	}
}
