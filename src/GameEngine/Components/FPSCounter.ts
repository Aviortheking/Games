import GameEngine from 'GameEngine'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'
import TextRenderer from 'GameEngine/Renderer/TextRenderer'

export default class FPSCounter extends Component2D<{size?: number}> {
	public name = 'FPSCounter'

	public position: Vector2D = new Vector2D(1)
	public renderer: TextRenderer = new TextRenderer(this, {text: 'loading...', color: 'black', stroke: 'white'})

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

		if (this.params.size) {
			this.renderer.size = this.params.size
		}
	}

	public update() {
		const lastFrame = GameEngine.getGameEngine().lastFrame
		// this.renderer.color = 'black'
		// if (!t) {return}
		// console.log(this.previousFrameTimes, t)
		const diff = lastFrame - this.lastUpdate
		this.lastUpdate = lastFrame
		this.previousFrameTimes.push(diff)
		if (this.previousFrameTimes.length > this.length) {
			this.previousFrameTimes.shift()
		}
		// const time = (this.previousFrameTimes.reduce((p, c) => p + c, 0)) / this.previousFrameTimes.length
		const time = this.previousFrameTimes.slice().sort()[Math.round(this.previousFrameTimes.length / 2)]
		// this.renderer.text = this.previousFrameTimes.join(', ')
		if (time === 0) {
			this.renderer.text = 'a lot'
		} else if (time < 0) {
			this.renderer.text = 'Loading...'
		} else {
			this.renderer.text = (1000 / time).toFixed(0)
		}
	}

}
