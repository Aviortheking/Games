import BoxCollider2D from '../2D/Collider/BoxCollider2D'
import Vector2D from '../2D/Vector2D'
import Component2D, { ComponentState } from '../Component2D'
import Renderer from '../Renderer'
import { apply } from '../libs/CodeUtils'
import Cursor from './Cursor'

export default class ComponentRenderer extends Component2D<{
	renderer?: Renderer
	position?: Vector2D
	scale?: Vector2D
	onClick?: () => void
	onDown?: () => void
	onUp?: () => void
	collisionTag?: string | Array<string>
}> {

	public name = 'ComponentRenderer'

	// eslint-disable-next-line complexity
	public update(states: ComponentState): void | Promise<void> {
		if (this.params.onClick && !this.collider) {
			this.collider = apply(new BoxCollider2D(this, {scale: new Vector2D(2)}), (it) => it.tags = this.params.collisionTag)
		} else if (this.params.onClick || this.params.onDown) {
			const collision = states.collisions?.find((it) => it.component instanceof Cursor)
			const cursor = collision?.component as Cursor
			if (cursor && !cursor.isDown && cursor.wasDown) {
				this.params.onClick?.()
				this.params.onUp?.()
			} else if (cursor && cursor.isDown && !cursor.wasDown) {
				this.params.onDown?.()
			}
		}
	}

	public updateRenderer(key: string, value: any) {
		this.renderer?.setProps({[key]: value})
	}

	protected onParamUpdated(key: string, value: any): void {
		if (this.params.renderer) {
			this.renderer = this.params.renderer
		}

		if (this.params.position) {
			this.position = this.params.position
		}

		if (this.params.scale) {
			this.scale = this.params.scale
		}
	}

}
