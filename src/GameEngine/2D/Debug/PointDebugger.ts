import Component2D from '../../Component2D'
import RectRenderer from '../../Renderer/RectRenderer'
import Vector2D from '../Vector2D'

interface Props {
	point: Vector2D
	color?: string
	size?: number
}

export default class PointDebugger extends Component2D<Props> {
	public override zIndex?: number = 900
	public override init() {
		this.scale = new Vector2D(this.params.size ?? 1)
		this.position = this.params.point
		// console.log('Debugging point at location', point)
		// this.origin = component.origin
		this.renderer = new RectRenderer(this, {material: this.params.color ?? 'red'})
	}
}
