import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collision/BoxCollider2D'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import { globalState } from '.'
import Cursor from './Cursor'
import TextComponent from './TextComponent'

export default class Space extends Component2D {
	public static shouldReset = false

	public size = {
		width: 3, height: 1
	}

	public renderer: RectRenderer = new RectRenderer(this)
	public collider: BoxCollider2D = new BoxCollider2D(this, 'click')

	public position: Vector2D = new Vector2D(0, 0)

	public scale: Vector2D = new Vector2D(30, 10)

	private posBeforeCursor: Vector2D | null = null
	private basePosition: Vector2D

	private hasMoved = false

	public constructor(
		position: Vector2D,
		size: Vector2D,
		private cursor: Cursor,
		private placeableRects: Array<[Vector2D, Vector2D]>,
		private log: boolean = false
	) {
		super()
		this.position = position
		this.basePosition = position
		// this.debug = true
		this.scale = size

		const text = `${size.x}x${size.y}`
		this.childs = [
			new TextComponent(this, text, 'bold', 8, 'blue')
		]
	}

	public update(state: ComponentState): void | Promise<void> {
		// state.mouseHovering
		const point = this.scale.div(2).sub(this.position)

		this.renderer.material = 'white'
		this.renderer.stroke = {color: 'black', width: 3}
		const cursor = GameEngine.getGameEngine().cursor
		if (this.log) console.log(Space.shouldReset)
		if (state.isColliding === 'click' || state.isColliding === 'down') {
			if (!this.hasMoved) {
				this.hasMoved = true
				if (this.scale.x === 10) {
					globalState.x10Moved ++
				} else {
					globalState.x20Moved ++
				}
			}
			this.renderer.stroke = {color: 'green', width: 3}
			if (!this.posBeforeCursor) {
				this.posBeforeCursor = this.position
			}
			// console.log('follow cursor', cursor.position, this.position)
			this.position = cursor.position
			let canPlace = false
			for (const placeableRect of this.placeableRects) {
				if (point.isIn(placeableRect[0], this.scale.sub(placeableRect[1]))) {
					canPlace = true
					break
				}
			}
			if (!canPlace) {
				this.renderer.stroke = {color: 'red', width: 3}
			}
			else {
				this.posBeforeCursor = this.position
			}
		} else if (this.posBeforeCursor) {
			const futurePosition = this.position.decimalCount(0)
			let canPlace = false
			for (const placeableRect of this.placeableRects) {
				if (point.isIn(placeableRect[0], this.scale.sub(placeableRect[1]))) {
					canPlace = true
					break
				}
			}
			if (!canPlace) {
				this.position = this.posBeforeCursor.decimalCount(0)
			} else {
				this.position = futurePosition
			}
			this.posBeforeCursor = null
		}

		if (Space.shouldReset) {
			this.position = this.basePosition
			this.hasMoved = false
		}
	}
}
