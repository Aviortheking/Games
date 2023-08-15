import GameEngine from '..'
import Vector2D from '../2D/Vector2D'
import Component2D from '../Component2D'
import TextRenderer from '../Renderer/TextRenderer'

export default class FPSCounter extends Component2D<{size?: number}> {
	public name = 'FPSCounter'

	public override position: Vector2D = new Vector2D(0)
	public override scale: Vector2D = new Vector2D(100, 1)
	public override renderer: TextRenderer = new TextRenderer(this, {text: 'loading...', color: 'black', stroke: 'white'})

	public override init() {

		if (this.params.size) {
			this.renderer.setProps({size: this.params.size})
		}
	}

	public override update() {
		const perfs = GameEngine.getGameEngine().currentScene?.updatePerformances
		if (!perfs || perfs.total === -1) {
			this.renderer.setProps({text: 'Loading...'})
			return
		}
		this.renderer.setProps({text: (1000 / (perfs.total ?? 1)).toFixed(0)})
	}

}
