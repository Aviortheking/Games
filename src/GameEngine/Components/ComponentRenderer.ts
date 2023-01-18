import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'
import Renderer from 'GameEngine/Renderer'

export default class ComponentRenderer extends Component2D<{
	renderer?: Renderer
	position?: Vector2D
	scale?: Vector2D
	name?: string
}> {

	public name = 'ComponentRenderer'

	public update(): void | Promise<void> {
		if (this.params.renderer) {
			this.renderer = this.params.renderer
		}

		if (this.params.name) {
			this.name = this.params.name
		}

		if (this.params.position) {
			this.position = this.params.position
		}

		if (this.params.scale) {
			this.scale = this.params.scale
		}
	}

	public updateRenderer(key: string, value: any) {
		(this.renderer as any)[key as any] = value
	}

}
