import { stat } from 'fs'
import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collision/BoxCollider2D'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import Renderer from 'GameEngine/Renderer'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'

export default class Cursor extends Component2D {

	public renderer: RectRenderer = new RectRenderer(this)
	public collider: BoxCollider2D = new BoxCollider2D(this, 'click')

	public position: Vector2D = new Vector2D(0, 0)

	public scale: Vector2D = new Vector2D(1, 1)

	// public origin: Vector2D = new Vector2D(0.5, 0.5)

	public update(state: ComponentState): void | Promise<void> {
		// state.mouseHovering

		this.renderer.material = 'blue'
		const cursor = GameEngine.getGameEngine().cursor
		this.position = cursor.position
	}
}
