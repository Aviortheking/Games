import ComponentDebug from 'GameEngine/2D/Debug/ComponentDebug'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'
import Renderer from 'GameEngine/Renderer'
import TextRenderer from 'GameEngine/Renderer/TextRenderer'

export default class FPSCounter extends Component2D {


	public position: Vector2D = new Vector2D(0,0)
	public scale: Vector2D = new Vector2D(1, 1)
	public origin: Vector2D = new Vector2D(0, 0)
	public childs: Array<Component2D> = [new ComponentDebug(this)]

	public renderer: TextRenderer = new TextRenderer(this, {text: 'pouet'})

	private lastUpdate: number = new Date().getTime()

	public update() {
		const now = new Date().getTime()
		this.renderer.text = (1000 / (now - this.lastUpdate)).toFixed(2)
		this.lastUpdate = now
	}

}
