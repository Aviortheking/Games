import GameEngine from '..'
import PointCollider2D from '../2D/Collider/PointCollider2D'
import Vector2D from '../2D/Vector2D'
import Component2D from '../Component2D'
import MultiRenderer from '../Renderer/MultiRenderer'
import RectRenderer from '../Renderer/RectRenderer'
import TextRenderer from '../Renderer/TextRenderer'
import { apply } from '../libs/CodeUtils'
import Camera from './Camera'

type MoveEvents = 'leftClickDown' | 'middleClickDown'

interface ButtonState {
	/**
	 * left button is down (refreshed each frames)
	 */
	isDown: boolean
	/**
	 * left button was down previous frame (refreshed each frames)
	 */
	wasDown: boolean
	/**
	 * left button is down in realtime
	 */
	eventDown: boolean
}

export default class Cursor extends Component2D<{
	debug?: boolean
	disableZoom?: boolean
	workOverInterface?: boolean
	/**
	 * allow the cursor to move the view
	 */
	enabledMove?: boolean | MoveEvents | Array<MoveEvents>
	zIndex?: number
}> {
	public name = 'Cursor'

	/**
	 * cursor position
	 */
	public override position: Vector2D = new Vector2D(0,0)

	public leftBtn = {
		isDown: false,
		wasDown: false,
		eventDown: false,
		canChange: true
	}

	public rightBtn = {
		isDown: false,
		wasDown: false,
		eventDown: false,
		canChange: true
	}

	public middleBtn = {
		isDown: false,
		wasDown: false,
		eventDown: false,
		canChange: true
	}

	public override origin: Vector2D = new Vector2D(0)

	public override scale: Vector2D = new Vector2D(1)

	public override collider: PointCollider2D = new PointCollider2D(this, {
		tags: 'cursor'
	})

	private touchZoom = 0

	private oldPosition: [number, number] | null = null

	private base!: Window | Element

	/**
	 * is the cursor click is down
	 */
	public get isDown(): boolean {
		return this.leftBtn.isDown || this.rightBtn.isDown || this.middleBtn.isDown
	}

	/**
	 * was the cursor click down on previous frame
	 */
	public get wasDown(): boolean {
		return this.leftBtn.wasDown || this.rightBtn.wasDown || this.middleBtn.wasDown
	}

	public override init(): void | Promise<void> {
		this.base = window ?? GameEngine.getGameEngine().canvas
		this.base.addEventListener('mousemove', this.onMouseMove)
		this.base.addEventListener('mousedown', this.onMouseDown)
		this.base.addEventListener('touchmove', this.onTouchMove, { passive: false })
		this.base.addEventListener('touchstart', this.onTouchStart)
		if (this.params.zIndex) {
			this.zIndex = this.params.zIndex
		}

		// add up events on document so they are catched everywhere
		window.addEventListener('mouseup', this.onMouseUp)
		window.addEventListener('touchend', this.onTouchEnd)

		// this.debug = this.params?.debug
		if (this.params.debug) {
			this.renderer = new MultiRenderer(this, {
				renderers: [
					new RectRenderer(this, {material: 'blue'}),
					new TextRenderer(this, {
						color: 'black',
						text: '',
						size: 16,
						overrideSizeLimit: true
					})
				]
			})
		}
	}

	public override destroy(): void {
		this.base.removeEventListener('mousemove', this.onMouseMove as any)
		this.base.removeEventListener('mousedown', this.onMouseDown as any)
		this.base.removeEventListener('touchmove', this.onTouchMove as any)
		this.base.removeEventListener('touchstart', this.onTouchStart as any)

		// add up events on document so they are catched everywhere
		window.removeEventListener('mouseup', this.onMouseUp)
		window.removeEventListener('touchend', this.onTouchEnd)
	}

	public override update(): void | Promise<void> {
		this.leftBtn.wasDown = this.leftBtn.isDown
		this.leftBtn.isDown = this.leftBtn.eventDown
		this.leftBtn.canChange = true
		this.rightBtn.wasDown = this.rightBtn.isDown
		this.rightBtn.isDown = this.rightBtn.eventDown
		this.rightBtn.canChange = true
		this.middleBtn.wasDown = this.middleBtn.isDown
		this.middleBtn.isDown = this.middleBtn.eventDown
		this.middleBtn.canChange = true
		if (this.params.debug) {
			console.log('update')
			;((this.renderer as MultiRenderer).props.renderers?.[1] as TextRenderer).setProps({text: `${JSON.stringify(this.leftBtn, undefined, '\t')}\npos: ${this.position.toFixed(3)}`})
		}
	}

	public triggerUpdate() {
		this.updatePosition(...this.oldPosition ?? [0, 0])
	}

	public setPosition(clientX: number, clientY: number) {
		this.updatePosition(clientX, clientY)
	}

	public getPosition() {
		return this.position
	}

	private onMouseMove = (ev: MouseEvent) => {
		if (this.params.debug) {
			console.log('onMouseMove')
		}
		this.onMove(ev)
	}

	// eslint-disable-next-line complexity
	private onMouseDown = (ev: MouseEvent) => {
		if (this.params.debug) {
			console.log('onMouseDown')
		}
		switch (ev.button) {
			case 0:
				this.leftBtn.eventDown = true
				this.leftBtn.canChange = false
				break
			case 2:
				this.rightBtn.eventDown = true
				this.rightBtn.canChange = false
				break
			case 1:
				this.middleBtn.eventDown = true
				this.middleBtn.canChange = false
				break
			default:
				console.warn('WTF is this mouse button')
				break
		}
		this.onDown(ev)
	}

	// eslint-disable-next-line complexity
	private onMouseUp = (ev: MouseEvent) => {
		if (this.params.debug) {
			console.log('onMouseUp')
		}
		switch (ev.button) {
			case 0:
				this.leftBtn.eventDown = false
				this.leftBtn.canChange = false
				break
			case 2:
				if (!this.rightBtn.canChange) {
					break
				}
				this.rightBtn.eventDown = false
				this.rightBtn.canChange = false
				break
			case 1:
				if (!this.middleBtn.canChange) {
					break
				}
				this.middleBtn.eventDown = false
				this.middleBtn.canChange = false
				break
			default:
				console.warn('WTF is this mouse button')
				break
		}
		this.onUp(ev)
	}

	// eslint-disable-next-line complexity
	private onTouchMove = (ev: TouchEvent) => {
		if (this.params.debug) {
			console.log('onTouchMove')
		}
		this.leftBtn.eventDown = true
		if (ev.touches.length >= 2 && !this.params.disableZoom) {
			ev.preventDefault()

			// launch the onMove event with the pointer position being at the center of both points
			const xMin = Math.min(ev.touches[0].pageX, ev.touches[1].pageX)
			const xMax = Math.max(ev.touches[0].pageX, ev.touches[1].pageX)
			const yMin = Math.min(ev.touches[0].pageY, ev.touches[1].pageY)
			const yMax = Math.max(ev.touches[0].pageY, ev.touches[1].pageY)

			this.onMove([
				xMin + (xMax - xMin) / 2,
				yMin + (yMax - yMin) / 2
			])

			const cam = GameEngine
				.getGameEngine()
				.currentScene
				?.camera
			if (!cam) {
				return
			}

			const nv = Math.hypot(
				ev.touches[0].pageX - ev.touches[1].pageX,
				ev.touches[0].pageY - ev.touches[1].pageY
			)

			cam.addToZoom(-((this.touchZoom - nv) / 100), 1)
			this.touchZoom = nv
			return
		}
		this.onMove(ev.touches.item(0) ?? undefined)
	}

	private onTouchStart = (ev: TouchEvent) => {
		if (this.params.debug) {
			console.log('onTouchStart')
		}
		this.leftBtn.eventDown = true
		this.onDown(ev.touches.item(0) ?? undefined)
		if (ev.touches.length >= 2) {
			this.touchZoom = Math.hypot(
				ev.touches[0].pageX - ev.touches[1].pageX,
				ev.touches[0].pageY - ev.touches[1].pageY
			)
		}
	}

	private onTouchEnd = (ev: TouchEvent) => {
		if (this.params.debug) {
			console.log('onTouchEnd')
		}
		this.leftBtn.eventDown = false
		this.onUp(ev.touches.item(0) ?? undefined)
	}

	/**
	 * Catch the onMove events
	 */
	private onMove(ev?: MouseEvent | Touch | [number, number]) {
		if (Array.isArray(ev)) {
			this.updatePosition(
				ev[0],
				ev[1]
			)
			return
		}
		if (ev) {
			// console.log('onMove')
			this.updatePosition(
				ev.clientX ?? 0,
				ev.clientY ?? 0
			)
		}
	}

	/**
	 * Catch the onDown events
	 */
	// eslint-disable-next-line complexity
	private onDown(ev?: MouseEvent | Touch) {
		if (ev) {
			if ((ev.target as HTMLElement).nodeName !== 'CANVAS' && !this.params.workOverInterface) {
				return
			}
			// console.log('onDown')
			this.updatePosition(
				ev.clientX ?? 0,
				ev.clientY ?? 0
			)
		}
	}

	/**
	 * catch the onUp events
	 */
	private onUp(ev?: MouseEvent | Touch) {
		// console.log('onUp')
		if (ev) {
			this.updatePosition(
				ev.clientX ?? 0,
				ev.clientY ?? 0
			)
		}
		this.oldPosition = null
	}

	// eslint-disable-next-line complexity
	private updatePosition(clientX: number, clientY: number) {
		const ge = GameEngine.getGameEngine()
		if (!ge) {
			return
		}
		const moveEvents: Array<MoveEvents> =
			this.params.enabledMove === true && ['leftClickDown', 'middleClickDown'] ||
			typeof this.params.enabledMove === 'string' && [this.params.enabledMove] ||
			(Array.isArray(this.params.enabledMove) ? this.params.enabledMove : [])

		let doMove = false
		for (const event of moveEvents) {
			if (event === 'leftClickDown' && this.leftBtn.isDown) {
				doMove = true
				break
			}
			if (event === 'middleClickDown' && this.middleBtn.isDown) {
				doMove = true
				break
			}
		}

		if (doMove && this.oldPosition) {
			const camera = ge.currentScene?.components.find((it) => it instanceof Camera) as Camera | undefined
			if (camera) {
				const diff = [this.oldPosition[0] - clientX, this.oldPosition[1] - clientY]
				camera.position = camera.position.sum(diff[0] / 5 / camera.zoom, diff[1] / 5 / camera.zoom)
			}
		}
		this.oldPosition = [clientX, clientY]
		this.position.set(Vector2D.fromBrowser(clientX, clientY))
	}
}
