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
import Cursor from './Cursor'

export default class TextComponent extends Component2D {


	public renderer: TextRenderer = new TextRenderer(this)

	// public position: Vector2D = new Vector2D(0, 0)

	public constructor(private parent: Component2D, text: string, weight?: 'bold', size?: number, color?: string) {
		super()
		this.renderer.text = text
		this.renderer.weight = weight
		this.renderer.size = size
		this.renderer.color = color
	}

	public update(state: ComponentState): void | Promise<void> {
		this.position = this.parent.position
	}
}
