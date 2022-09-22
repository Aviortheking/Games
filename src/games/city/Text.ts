import { stat } from 'fs'
import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collision/BoxCollider2D'
import ColliderDebugger from 'GameEngine/2D/Debug/ColliderDebugger'
import PointDebugger from 'GameEngine/2D/Debug/PointDebugger'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import Renderer from 'GameEngine/Renderer'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import TextRenderer from 'GameEngine/Renderer/TextRenderer'
import { globalState } from '.'
import Cursor from './Cursor'

export default class Text extends Component2D {


	public renderer: TextRenderer = new TextRenderer(this)

	// public position: Vector2D = new Vector2D(0, 0)

	public constructor(private type: keyof typeof globalState, weight?: 'bold', size?: number, color?: string) {
		super()
		switch (type) {
		case 'x10Moved':
			this.position = new Vector2D(10, 40)
			break
		case 'x20Moved':
			this.position = new Vector2D(10, 43)
			break
		default:
			break
		}
		this.renderer.text = 'nique'
		this.renderer.weight = weight
		this.renderer.size = size
		this.renderer.color = color
	}

	public update(state: ComponentState): void | Promise<void> {
		switch (this.type) {
		case 'x10Moved':
			this.renderer.text = '10x20: ' + (5 - globalState.x10Moved)
			break
		case 'x20Moved':
			this.renderer.text = '10x20: ' + (5 - globalState.x20Moved)
			break
		default:
			break
		}
	}
}
