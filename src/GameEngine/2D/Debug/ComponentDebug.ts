import Component2D from 'GameEngine/Component2D'
import Vector2D from '../Vector2D'
import PointDebugger from './PointDebugger'

export default class ComponentDebug extends Component2D {
	public readonly name = 'ComponentDebug'
	public constructor(component: Component2D) {
		super()
		this.position = new Vector2D(0, 0)
		// this.origin = component.origin
		this.scale = component.scale
		console.log('Position of the origin point', this.position)
		// this.renderer = new RectRenderer(this, {material: 'red'})
		this.childs = [
			new PointDebugger(new Vector2D(0, 0), 'aqua'),
			new PointDebugger(this.origin, 'green'),
			new PointDebugger(component.position.sum(component.scale), 'aqua')
		]
	}
}
