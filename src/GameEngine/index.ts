import Vector2D from './2D/Vector2D'
import Scene from './Scene'

/**
 * TODO:
 * Animation Engine
 * Camera fined control
 * Collision
 */
export default class GameEngine {
	private static ge: GameEngine
	public ctx: CanvasRenderingContext2D
	public canvas: HTMLCanvasElement
	public caseSize: Vector2D = new Vector2D(1, 1)
	public cursor: {
		position: Vector2D
		isDown: boolean
		wasDown: boolean
	} = {
		position: new Vector2D(0, 0),
		isDown: false,
		wasDown: false
	}
	public currentScene?: Scene

	// last frame timestamp
	public lastFrame = 0

	/**
	 * last frame execution time in milliseconds
	 *
	 * @memberof GameEngine
	 */
	public frameTime = 0

	private isRunning = false


	// timer between frames
	private timer = 0


	public constructor(
		id: string,
		public options?: {
			caseCount?: number | [number, number]
			background?: string
			debugColliders?: boolean
			/**
			 * Maximum framerate you want to achieve
			 *
			 * note: -1 mean infinite
			 */
			goalFramerate?: number
		}
	) {
		GameEngine.ge = this
		const canvas = document.querySelector<HTMLCanvasElement>(id)
		if (!canvas) {
			throw new Error('Error, canvas not found!')
		}
		this.canvas = canvas
		if (this.options?.caseCount) {
			this.caseSize = new Vector2D(
				// @ts-expect-error idc
				this.canvas.width / ((typeof this.options.caseCount) !== 'number' ? this.options.caseCount[0] : this.options.caseCount ),
				// @ts-expect-error idc2 lol
				this.canvas.height / ((typeof this.options.caseCount) !== 'number' ? this.options.caseCount[1] : this.options.caseCount)
			)
		}

		const ctx = canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Error, Context could not get found!')
		}
		ctx.imageSmoothingEnabled = false
		this.ctx = ctx

		if (options?.goalFramerate && options.goalFramerate >= 0) {
			this.timer = 1000 / options.goalFramerate
		}
	}

	public static getGameEngine(): GameEngine {
		return this.ge
	}

	public start() {
		if (this.isRunning) {
			console.warn('Game is already running')
			return
		}
		this.isRunning = true
		this.currentScene?.init().then(() => this.update())
		document.addEventListener('mousemove', (ev) => {
			this.cursor.position = new Vector2D(
				(ev.clientX + window.scrollX) / this.caseSize.x - (this.currentScene?.camera?.topLeft?.x ?? 0),
				(ev.clientY + window.scrollY) / this.caseSize.y - (this.currentScene?.camera?.topLeft?.y ?? 0)
			)
			if (this.cursor.isDown) {
				this.cursor.wasDown = true
			}
		})
		document.addEventListener('mousedown', () => {
			console.log('cursor down')
			this.cursor.isDown = true
		})
		document.addEventListener('mouseup', () => {
			console.log('cursor up')
			this.cursor.isDown = false
			this.cursor.wasDown = false
		})
	}

	public pause() {
		this.isRunning = false
	}

	public async setScene(scene: Scene | string) {
		console.log('Setting scene', typeof scene === 'string' ? scene : scene.id)
		const wasRunning = this.isRunning
		if (wasRunning) {
			this.isRunning = false
		}
		await this.currentScene?.destroy()
		await this.currentScene?.init()
		if (wasRunning) {
			this.isRunning = true
		}
		this.currentScene = typeof scene === 'string' ? Scene.scenes[scene] : scene
		this.currentScene.setGameEngine(this)
	}

	private async update() {
		// console.log('update')
		let frameFinished = true
		setInterval((it) => {
			// get current time
			const now = window.performance.now()

			// game is not runnig, wait a frame
			if (!this.isRunning || !frameFinished) {
				// console.log('skip frame')
				// setTimeout(() => {
				// 	this.update()
				// }, this.timer)
				return
			}

			// game is running too fast, wait until necessary
			if (this.lastFrame + this.timer > now ) {
				// console.log('skip frame')
				// setTimeout(() => {
				// 	this.update()
				// }, (this.lastFrame + this.timer) - now)
				return
			}
			// console.log('new frame')
			frameFinished = false

			// if a background need to be drawn
			if (this.options?.background) {
				this.ctx.fillStyle = this.options.background
				this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
			} else {
				// clear the previous frame
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
			}

			// update scene
			this.currentScene?.update()

			// calculate for next frame
			this.lastFrame = window.performance.now()
			this.frameTime = window.performance.now() - now
			frameFinished = true
			// this.update()
			// requestAnimationFrame(() => {
			// })
		})
	}
}

export interface GameState<UserState = any> {
	gameEngine: GameEngine
	userState: UserState
}
