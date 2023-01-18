import GameEngine from 'GameEngine'
import PointCollider2D from 'GameEngine/2D/Collider/PointCollider2D'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import Camera from './Camera'

export default class Cursor extends Component2D<{
	debug?: boolean
} | void> {
	public name = 'Cursor'

	/**
	 * cursor position
	 */
	public position: Vector2D = new Vector2D(0,0)

	/**
	 * is the cursor down
	 */
	public isDown = false

	/**
	 * was the cursor down on previous frame
	 */
	public wasDown = false

	public origin: Vector2D = new Vector2D(0)

	public scale: Vector2D = new Vector2D(1)

	public collider: PointCollider2D = new PointCollider2D()

	private touchZoom = 0

	/**
	 * event handled down event
	 * (can be updated between frames while the isDown/wasDown are updated with the other components)
	 */
	private eventDown = false

	private oldPosition: [number, number] = [0, 0]

	public init(): void | Promise<void> {
		this.debug = this.params?.debug
		const canvas = GameEngine.getGameEngine().canvas
		canvas.addEventListener('mousemove', this.onMouseMove)
		canvas.addEventListener('mousedown', this.onMouseDown)
		canvas.addEventListener('touchmove', this.onTouchMove)
		canvas.addEventListener('touchstart', this.onTouchStart)

		// add up events on document so they are catched everywhere
		document.addEventListener('mouseup', this.onMouseUp)
		document.addEventListener('touchend', this.onTouchEnd)

		if (this.debug) {
			this.renderer = new RectRenderer(this, {material: 'blue'})
		}
	}

	public destroy(): void | Promise<void> {
		const canvas = GameEngine.getGameEngine().canvas
		canvas.removeEventListener('mousemove', this.onMouseMove)
		canvas.removeEventListener('mousedown', this.onMouseDown)
		canvas.removeEventListener('touchmove', this.onTouchMove)
		canvas.removeEventListener('touchstart', this.onTouchStart)

		// add up events on document so they are catched everywhere
		document.removeEventListener('mouseup', this.onMouseUp)
		document.removeEventListener('touchend', this.onTouchEnd)
	}

	public update(): void | Promise<void> {
		this.wasDown = this.isDown
		this.isDown = this.eventDown
	}

	public triggerUpdate() {
		this.updatePosition(...this.oldPosition)
	}

	private onMouseMove = (ev: MouseEvent) => {
		// console.log('onMouseMove')
		this.onMove(ev)
	}

	private onMouseDown = (ev: MouseEvent) => {
		// console.log('onMouseDown')
		this.onDown(ev)
	}

	private onMouseUp = (ev: MouseEvent) => {
		// console.log('onMouseUp')
		this.onUp(ev)
	}


	private onTouchMove = (ev: TouchEvent) => {
		// console.log('onTouchMove')
		this.onMove(ev.touches.item(0) ?? undefined)
		if (ev.touches.length >= 2) {
			const cam = GameEngine.getGameEngine().currentScene?.getComponents().find((it) => it.name === 'Camera') as Camera | undefined
			if (!cam) {
				return
			}

			const nv = Math.hypot(
				ev.touches[0].pageX - ev.touches[1].pageX,
				ev.touches[0].pageY - ev.touches[1].pageY
			)

			cam.addToZoom(-((this.touchZoom - nv) / 100), 1)
			this.touchZoom = nv
		}
	}

	private onTouchStart = (ev: TouchEvent) => {
		// console.log('onTouchStart')
		this.onDown(ev.touches.item(0) ?? undefined)
		if (ev.touches.length >= 2) {
			this.touchZoom = Math.hypot(
				ev.touches[0].pageX - ev.touches[1].pageX,
				ev.touches[0].pageY - ev.touches[1].pageY
			)
		}
	}

	private onTouchEnd = (ev: TouchEvent) => {
		// console.log('onTouchEnd')
		this.onUp(ev.touches.item(0) ?? undefined)
	}

	/**
	 * Catch the onMove events
	 */
	private onMove(ev?: MouseEvent | Touch) {
		if (ev) {
			this.updatePosition(
				ev.clientX ?? 0,
				ev.clientY ?? 0
			)
		}
	}

	/**
	 * Catch the onDown events
	 */
	private onDown(ev?: MouseEvent | Touch) {
		// console.log('cursor down')
		if (ev) {
			this.updatePosition(
				ev.clientX ?? 0,
				ev.clientY ?? 0
			)
		}
		this.eventDown = true
	}

	/**
	 * catch the onUp events
	 */
	private onUp(ev?: MouseEvent | Touch) {
		// console.log('cursor up')
		if (ev) {
			this.updatePosition(
				ev.clientX ?? 0,
				ev.clientY ?? 0
			)
		}
		this.eventDown = false
	}

	// eslint-disable-next-line complexity
	private updatePosition(clientX: number, clientY: number) {
		const ge = GameEngine.getGameEngine()
		if (!ge) {
			return
		}
		this.oldPosition = [clientX, clientY]
		this.position.set(
			((clientX ?? 0) + window.scrollX - ge.canvas.offsetLeft) /
			(ge.currentScene?.scale ?? 1) * ge.getXCaseCount() /
			ge.canvas.offsetWidth + (ge.currentScene?.position?.x ?? 0),

			((clientY ?? 0) + window.scrollY - ge.canvas.offsetTop) /
			(ge.currentScene?.scale ?? 1) * ge.getYCaseCount() /
			ge.canvas.offsetHeight + (ge.currentScene?.position?.y ?? 0)
		)
	}
}
