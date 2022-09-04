import { stat } from 'fs'
import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collision/BoxCollider2D'
import ColliderDebugger from 'GameEngine/2D/Debug/ColliderDebugger'
import PointDebugger from 'GameEngine/2D/Debug/PointDebugger'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import Renderer from 'GameEngine/Renderer'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import Cursor from './Cursor'
import TextComponent from './TextComponent'

export default class Space extends Component2D {
	private static isOnCursor = false

	public size = {
		width: 3, height: 1
	}



	public renderer: RectRenderer = new RectRenderer(this)
	public collider: BoxCollider2D = new BoxCollider2D(this, 'click')

	public position: Vector2D = new Vector2D(0, 0)

	public scale: Vector2D = new Vector2D(30, 10)

	private posBeforeCursor: Vector2D | null = null
	public constructor(
		size: Vector2D,
		private cursor: Cursor,
		private placeableRects: Array<[Vector2D, Vector2D]>,
		private log: boolean = false
	) {
		super()
		// this.debug = true
		this.scale = size

		const text = `${size.x}x${size.y}`
		this.childs = [
			new TextComponent(this, text, 'bold', 16, 'blue')
		]
	}

	public update(state: ComponentState): void | Promise<void> {
		// state.mouseHovering
		const point = this.scale.div(2).sub(this.position)

		this.renderer.material = 'white'
		this.renderer.stroke = {color: 'black', width: 3}
		const cursor = GameEngine.getGameEngine().cursor
		// if (this.log) console.log(point)
		if (state.isColliding === 'click' || state.isColliding === 'down') {
			this.renderer.stroke = {color: 'green', width: 3}
			if (!this.posBeforeCursor) {
				this.posBeforeCursor = this.position
			}
			Space.isOnCursor = true
			// console.log('follow cursor', cursor.position, this.position)
			this.position = cursor.position.decimalCount(0)
			let canPlace = false
			for (const placeableRect of this.placeableRects) {
				if (point.isIn(placeableRect[0], this.scale.sub(placeableRect[1]))) {
					canPlace = true
					break
				}
			}
			if (!canPlace) this.renderer.stroke = {color: 'red', width: 3}
			else this.posBeforeCursor = this.position
		} else if (this.posBeforeCursor) {
			let canPlace = false
			for (const placeableRect of this.placeableRects) {
				if (point.isIn(placeableRect[0], this.scale.sub(placeableRect[1]))) {
					canPlace = true
					break
				}
			}
			if (!canPlace) {
				this.position = this.posBeforeCursor
			}
			Space.isOnCursor = false
			this.posBeforeCursor = null
		}
	}
}
