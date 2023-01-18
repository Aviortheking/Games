import GameEngine from 'GameEngine'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'
import Cursor from './Cursor'

/**
 * Currently not working Camera implementation
 */
export default class Camera extends Component2D<{
	position?: Vector2D
	zoom?: number
}> {
	public name = 'Camera'
	public position: Vector2D = new Vector2D(0)

	public zoom = 1

	public init(): void | Promise<void> {
		if (this.params.position) {
			this.position = this.params.position
		}
		if (this.params.zoom) {
			this.setZoom(this.params.zoom)
		}
	}

	public update() {
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
			const cursor = scene.getComponents().find((it) => it.name === 'Cursor') as Cursor | undefined
			cursor?.triggerUpdate()
		}
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
}
