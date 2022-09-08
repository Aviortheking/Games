import { stat } from 'fs'
import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collision/BoxCollider2D'
import ColliderDebugger from 'GameEngine/2D/Debug/ColliderDebugger'
import PointDebugger from 'GameEngine/2D/Debug/PointDebugger'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import Renderer from 'GameEngine/Renderer'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import { globalState } from '.'
import Cursor from './Cursor'
import Space from './Space'
import TextComponent from './TextComponent'

export default class Button extends Component2D {
	private static isOnCursor = false

	public size = {
		width: 3, height: 1
	}

	public renderer: RectRenderer = new RectRenderer(this)
	public collider: BoxCollider2D = new BoxCollider2D(this, 'click')

	public position: Vector2D = new Vector2D(10, 5)

	public scale: Vector2D = new Vector2D(20, 10)

	public constructor() {
		super()

		this.childs = [
			new TextComponent(this, 'remèttre à zéro', 'bold', 10, 'white')
		]
		this.renderer.material = 'black'
	}

	public update(state: ComponentState): void | Promise<void> {
		if (state.isColliding === 'click' || state.isColliding === 'down') {
			Space.shouldReset = true
			globalState.x10Moved = 0
			globalState.x20Moved = 0
		} else {
			Space.shouldReset = false

		}
	}
}
