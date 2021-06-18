import Component2D from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import Vector2D from '../Vector2D'

export default class ComponentDebug extends Component2D {
	public constructor(component: Component2D) {
		super()
		this.position = component.position
		this.origin = component.origin
		this.scale = new Vector2D(.1, .1)
		console.log('Position of the origin point', this.position)
		this.renderer = new RectRenderer(this, {material: 'red'})
	}
}
