import Scene from './Scene'

/**
 * TODO:
 * Animation Engine
 * Camera fined control
 * Collision
 */
export default class GameEngine {
	public ctx: CanvasRenderingContext2D
	public canvas: HTMLCanvasElement
	public caseSize: [number, number] = [1, 1]
	public cursor: {
		x: number
		y: number
		isDown: boolean
		wasDown: boolean
	} = {
		x: 0,
		y: 0,
		isDown: false,
		wasDown: false
	}
	private currentScene?: Scene
	private isRunning = false

	public constructor(
		private id: string,
		private options?: {
			caseCount?: number | [number, number]
			background?: string
		}
	) {
		const canvas = document.querySelector<HTMLCanvasElement>(id)
		if (!canvas) {
			throw new Error('Error, canvas not found!')
		}
		this.canvas = canvas
		if (this.options?.caseCount) {
			this.caseSize = [
				// @ts-expect-error idc
				this.canvas.width / ((typeof this.options.caseCount) !== 'number' ? this.options.caseCount[0] : this.options.caseCount ),
				// @ts-expect-error idc2 lol
				this.canvas.height / ((typeof this.options.caseCount) !== 'number' ? this.options.caseCount[1] : this.options.caseCount)
			]
		}

		const ctx = canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Error, Context could not get found!')
		}
		ctx.imageSmoothingEnabled = false
		this.ctx = ctx
	}

	public start() {
		if (this.isRunning) {
			console.warn('Game is already running')
			return
		}
		this.isRunning = true
		requestAnimationFrame(() => {
			this.update()
		})
		document.addEventListener('mousemove', (ev) => {
			this.cursor.x = ev.clientX
			this.cursor.y = ev.clientY
			if (this.cursor.isDown) {
				this.cursor.wasDown = true
			}
		})
		document.addEventListener('mousedown', () => {
			this.cursor.isDown = true
		})
		document.addEventListener('mouseup', () => {
			this.cursor.isDown = false
			this.cursor.wasDown = false
		})
	}

	public pause() {
		this.isRunning = false
	}

	public setScene(scene: Scene | string) {
		this.currentScene = typeof scene === 'string' ? Scene.scenes[scene] : scene
		this.currentScene.setGameEngine(this)
	}


	private update() {
		if (!this.isRunning) {
			return
		}
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		if (this.options?.background) {
			this.ctx.fillStyle = this.options.background
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
		}
		this.currentScene?.update()
		setTimeout(() => {
			this.update()
		}, 0)
	}
}
