import GameEngine from 'GameEngine'
import ComponentDebug from 'GameEngine/2D/Debug/ComponentDebug'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'
import TextRenderer from 'GameEngine/Renderer/TextRenderer'

export default class FPSCounter extends Component2D<{textColor?: string, size?: number}> {


	public position: Vector2D = new Vector2D(10,8)
	public scale: Vector2D = new Vector2D(1, 1)
	public origin: Vector2D = new Vector2D(0, 0)
	public childs: Array<Component2D> = [new ComponentDebug(this)]

	public renderer: TextRenderer = new TextRenderer(this, {text: 'loading...'})

	private length = 1
	private previousFrameTimes: Array<number> = []
	private lastUpdate = window.performance.now() * 1000

	public init() {
		const fps = GameEngine.getGameEngine().options?.goalFramerate
		if (!fps || fps < 1) {
			this.length = 60
		} else {
			this.length = fps
		}

		if (this.params.textColor) {
			this.renderer.color = this.params.textColor
		}

		if (this.params.size) {
			this.renderer.size = this.params.size
		}
	}

	public update() {
		const t = GameEngine.getGameEngine().lastFrame
		// if (!t) {return}
		// console.log(this.previousFrameTimes, t)
		const diff = t - this.lastUpdate
		this.lastUpdate = t
		this.previousFrameTimes.push(diff)
		if (this.previousFrameTimes.length > this.length) {
			this.previousFrameTimes.shift()
		}
		const time = (this.previousFrameTimes.reduce((p, c) => p + c, 0)) / this.previousFrameTimes.length
		if (time === 0) {
			this.renderer.text = 'a lot'
		} else {
			this.renderer.text = (1000 / time).toFixed(2)

		}
	}

}
