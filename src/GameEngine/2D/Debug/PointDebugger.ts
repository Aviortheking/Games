import Component2D from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import Vector2D from '../Vector2D'

export default class PointDebugger extends Component2D {
	public constructor(point: Vector2D) {
		super()
		this.scale = new Vector2D(.1, .1)
		this.position = point
		console.log('Debugging point at location', point)
		// this.origin = component.origin
		this.renderer = new RectRenderer(this, {material: 'red'})
	}
}
