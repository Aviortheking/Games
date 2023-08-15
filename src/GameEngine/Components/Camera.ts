import GameEngine from '..'
import Vector2D from '../2D/Vector2D'
import Component2D from '../Component2D'
import TextRenderer from '../Renderer/TextRenderer'
import { apply } from '../libs/CodeUtils'
import MathUtils from '../libs/MathUtils'
import Cursor from './Cursor'

export default class Camera extends Component2D<{
	position?: Vector2D
	zoom?: number
	debug?: boolean
	minX?: number
	maxX?: number
	minY?: number
	maxY?: number
	minZoom?: number
	maxZoom?: number
	disableZoom?: boolean
	childs?: Array<Component2D>
}> {
	public name = 'Camera'
	// public position: Vector2D = new Vector2D(0)

	private _zoom = this.params.zoom ?? 1
	public get zoom() {
		return this._zoom
	}
	public set zoom(value) {
		if (value === this.params.zoom && this.params.disableZoom) {
			this._zoom = value
		}
		if (this.params.disableZoom) {
			return
		}
		const old = this._zoom
		this._zoom = MathUtils.clamp(value, this.params.minZoom ?? 0.01, this.params.maxZoom ?? Infinity)
		const ge = GameEngine.getGameEngine()
		this.scale = new Vector2D(
			ge.getXCaseCount() / this.zoom,
			ge.getYCaseCount() / this.zoom
		)
		this.onZoomChange(old, this._zoom)
	}

	public getScale(): Vector2D {
		const ge = GameEngine.getGameEngine()
		this.scale = new Vector2D(
			ge.getXCaseCount() / this.zoom,
			ge.getYCaseCount() / this.zoom
		)
		return this.scale
	}

	public init(): void | Promise<void> {
		if (this.params.position) {
			this.position = this.params.position
		}
		if (this.params.zoom) {
			this.setZoom(this.params.zoom)
		}

		if (this.debug) {
			this.renderer = new TextRenderer(this, {
				color: 'black',
				text: '',
				size: 16
			})
		}
		if (this.params.childs) {
			this.childs.push(
				...this.params.childs
			)
		}
	}

	// eslint-disable-next-line complexity
	public update() {
		this.position.set(
			MathUtils.clamp(this.position.x, this.params.minX ?? -Infinity, this.params.maxX ?? Infinity),
			MathUtils.clamp(this.position.y, this.params.minY ?? -Infinity, this.params.maxY ?? Infinity)
		)
		let needCursorUpdate = false
		const scene = GameEngine.getGameEngine()?.currentScene
		if (!scene) {
			return
		}

		if (scene.scale !== this.zoom) {
			scene.scale = this.zoom
			needCursorUpdate = true
		}

		if (!scene.position.equal(this.position)) {
			scene.position.set(this.position)
			needCursorUpdate = true
		}

		if (needCursorUpdate) {
			const cursor = scene.getComponents().find((it) => it instanceof Cursor) as Cursor | undefined
			cursor?.triggerUpdate()
		}

		if (this.debug) {
			apply(this.renderer as TextRenderer, (it) => {
				it.setProps({
					text: `pos: ${this.position.toFixed(3)}, scale: ${this.getScale().toFixed(3)}, zoom: ${this.zoom}`,
					size: 16 / this._zoom
				})
			})
		}
	}

	public setZoomAndPos(zoom: number, x: number | Vector2D, y?: number) {
		this._zoom = zoom
		this.position.set(x, y)
	}

	/**
	 *
	 * @param value zoom with 1 being the base
	 */
	public setZoom(value: number) {
		this.zoom = value
	}

	public addToZoom(value: number, min?: number, max?: number) {
		this.zoom += value
		if (min && min > this.zoom) {
			this.zoom = min
		}
		if (max && max < this.zoom) {
			this.zoom = max
		}
	}

	// eslint-disable-next-line complexity
	private onZoomChange(oldZoom: number, newZoom: number) {
		if (oldZoom === newZoom) {
			return
		}

		const ge = GameEngine.getGameEngine()
		const cursor = ge.currentScene?.getComponents().find((it) => it instanceof Cursor) as Cursor | undefined
		const amount = 1 - oldZoom / newZoom
		const scale = this.getScale()
		let at: Vector2D
		if (cursor) {
			at = cursor.position
		} else {
			at = this.position.sum(scale.div(2))
		}
		const newX = this.position.x + (at.x - this.position.x) * amount
		const newY = this.position.y + (at.y - this.position.y) * amount

		this.position.set(
			MathUtils.clamp(newX, this.params.minX ?? -Infinity, this.params.maxX ?? Infinity),
			MathUtils.clamp(newY, this.params.minY ?? -Infinity, this.params.maxY ?? Infinity)
		)
	}
}
