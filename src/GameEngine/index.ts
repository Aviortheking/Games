import { objectValues } from '@dzeio/object-util'
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
	public componentId = 0

	public currentScene?: Scene

	// last frame timestamp
	public lastFrame = 0

	/**
	 * last frame execution time in milliseconds
	 *
	 * @memberof GameEngine
	 */
	public frameTime = 0

	/**
	 * indicate if the engine is running
	 */
	public isRunning = false


	// timer between frames
	private timer = 0

	private loopId?: NodeJS.Timer

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
		if (GameEngine.ge) {
			this.destroy()
			// throw new Error('GameEngine already init')
		}
		GameEngine.ge = this
		const canvas = document.querySelector<HTMLCanvasElement>(id)
		if (!canvas) {
			throw new Error('Error, canvas not found!')
		}
		this.canvas = canvas
		if (this.options?.caseCount) {
			this.caseSize = new Vector2D(
				this.canvas.width / (
					typeof this.options.caseCount !== 'number' ? this.options.caseCount[0] : this.options.caseCount
				),
				this.canvas.height / (
					typeof this.options.caseCount !== 'number' ? this.options.caseCount[1] : this.options.caseCount
				)
			)
		}

		const ctx = canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Error, Context could not get found!')
		}
		ctx.imageSmoothingEnabled = true
		ctx.imageSmoothingQuality = 'high'
		this.ctx = ctx

		if (options?.goalFramerate && options.goalFramerate >= 0) {
			this.timer = 1000 / options.goalFramerate
		}
	}

	public static getGameEngine(): GameEngine {
		return this.ge as GameEngine
	}

	public start() {
		if (this.isRunning) {
			console.warn('Game is already running')
			return
		}
		this.isRunning = true
		this.currentScene?.init().then(() => this.update())
	}

	public pause() {
		this.isRunning = false
	}

	public async destroy() {
		this.isRunning = false
		for await (const scene of objectValues(Scene.scenes)) {
			await scene.destroy()
		}
		if (GameEngine.ge) {
			// @ts-expect-error normal behavior
			delete GameEngine.ge as any
		}
		if (this.loopId) {
			clearInterval(this.loopId)
		}
	}

	public getXCaseCount(): number {
		const caseCount = this.options?.caseCount
		if (caseCount) {
			if (typeof caseCount === 'number') {
				return caseCount
			} else {
				return caseCount[0]
			}
		}
		return this.canvas.offsetWidth
	}


	public getYCaseCount(): number {
		const caseCount = this.options?.caseCount
		if (caseCount) {
			if (typeof caseCount === 'number') {
				return caseCount
			} else {
				return caseCount[1]
			}
		}
		return this.canvas.offsetWidth
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

	private update() {
		if (this.loopId) {
			console.error('Already initialized')
			return
		}
		// console.log('update')
		this.loopId = setInterval(async () => {

			// get current time
			const now = window.performance.now()

			// game is not runnig, wait a frame
			if (!this.isRunning) {
				// console.log('skip frame 1')
				return
			}

			// game is running too fast, wait until necessary
			if (this.lastFrame + this.timer > now) {
				// console.log('skip frame 2')
				return
			}


			// console.log('new frame')

			// if a background need to be drawn
			if (this.options?.background) {
				this.ctx.fillStyle = this.options.background
				this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
			} else {
				// clear the previous frame
				this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
			}

			await this.currentScene?.update()
			// calculate for next frame
			this.lastFrame = window.performance.now()
			this.frameTime = window.performance.now() - now
		})
	}

}

export interface GameState<UserState = any> {
	gameEngine: GameEngine
	userState: UserState
}
