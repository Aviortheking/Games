import Component2D, { ComponentState } from '../../Component2D'
import ComponentRenderer from '../../Components/ComponentRenderer'
import RectRenderer from '../../Renderer/RectRenderer'
import TextRenderer from '../../Renderer/TextRenderer'
import Vector2D from '../Vector2D'

// TODO: rework it
export default class ColliderDebugger extends Component2D<{collision?: Array<string>}> {

	public readonly name = 'ColliderDebugger'

	public override renderer: RectRenderer = new RectRenderer(this, {stroke: 'transparent'})

	private textRenderer!: TextRenderer

	public override init() {
		if (!this.parent) {
			console.error('cant setup, no parent')
			return
		}
		this.collider = this.parent.collider
		this.position = new Vector2D(0)
		this.scale = this.parent.scale
		this.origin = this.parent.origin

		const text = new ComponentRenderer()
		this.textRenderer = new TextRenderer(text, {
			color: 'black',
			size: 1
		})
		text.updateParam('renderer', this.textRenderer)
		this.childs.push(text)
	}

	public override update(state: ComponentState) {
		const len = state.collisions?.length ?? 0
		this.renderer.setProps({
			material: len === 0 ? null : `rgba(0, 255, 0, .${len})`
		})
		this.textRenderer.setProps({text: len.toString()})
	}
}
