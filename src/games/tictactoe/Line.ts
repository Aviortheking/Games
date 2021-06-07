import Component2D from 'GameEngine/Component2D'
import ColorRenderer from 'GameEngine/Renderer/ColorRenderer'

export default class Line extends Component2D {

	public constructor(direction: number, index: number) {
		super()
		this.renderer = new ColorRenderer(this, 'orange')

		this.pos = {
			x: direction ? index ? 1.95 : .9 : 0,
			y: direction ? 0 : index ? .9 : 1.95
		}
		this.size = {
			width: direction ? .15 : 3,
			height: direction ? 3 : .15
		}
	}

}
