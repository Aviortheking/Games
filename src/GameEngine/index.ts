import { objectMap, objectValues } from '@dzeio/object-util'
import Vector2D from './2D/Vector2D'
import Scene from './Scene'

/**
 * TODO:
 * Animation Engine
 * Collision
 */
export default class GameEngine {
	private static ge: GameEngine
	public ctx: CanvasRenderingContext2D
	public canvas: HTMLCanvasElement
	public caseSize: Vector2D = new Vector2D(1, 1)
	public componentId = 0

	public currentScene?: Scene | null

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

	private loopId?: number

	// eslint-disable-next-line complexity
	public constructor(
		id: string,
		public options?: {
			caseCount?: number | [number, number]
			background?: string
			debugColliders?: boolean
			/**
			 * Maximum framerate you want to achieve
			 *
			 * note: -1/undefined mean infinite
			 */
			goalFramerate?: number
		}
	) {
		console.log('Setting up GameEngine')
		if (GameEngine.ge) {
			throw new Error('GameEngine already init')
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
		// if (!this.ge) {
		// 	throw new Error('Game Engine not initialized!')
		// }
		return this.ge as GameEngine
	}

	public start() {
		if (this.isRunning) {
			console.warn('Game is already running')
			return
		}
		this.isRunning = true
		this.currentScene!.init().then(() => this.update())
	}

	public pause() {
		this.isRunning = false
	}

	public debugPerformances() {
		setInterval(() => {
			console.log(
				'\n',
				...objectMap(this.currentScene?.updatePerformances ?? {}, (v, k) => [k, v.toFixed(2) + 'ms\n']).flat()
			)
		}, 100)
	}

	public destroy() {
		this.isRunning = false
		for (const scene of objectValues(Scene.scenes)) {
			scene.destroy()
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
		this.currentScene?.destroy()
		if (wasRunning) {
			this.isRunning = true
		}
		const res = typeof scene === 'string' ? Scene.scenes[scene] : scene
		if (!res) {
			throw new Error('Scene not found!')
		}
		this.currentScene = res
		await this.currentScene?.init()
		this.currentScene.setGameEngine(this)
	}

	private update() {
		if (this.loopId) {
			console.error('Already initialized')
			return
		}

		// indicate if the main loop has started
		let run = false
		this.loopId = requestAnimationFrame(() => {
			run = true
			this.loop()
		})
		// sometime the main loop do not start so we need to try again
		setTimeout(() => {
			if (!run) {
				clearInterval(this.loopId)
				delete this.loopId
				this.update()
			}
		}, 20)
	}

	private async loop() {
		// get current time
		const now = window.performance.now()

		// game is not runnig, wait a frame
		if (!this.isRunning) {
			// console.log('skip frame 1')
			this.loopId = requestAnimationFrame(() => this.loop())
			return
		}

		// game is running too fast, wait until necessary
		if (this.lastFrame + this.timer > now) {
			// console.log('skip frame 2')
			this.loopId = requestAnimationFrame(() => this.loop())
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

		this.loopId = requestAnimationFrame(() => this.loop())
	}

}

export interface GameState<UserState = any> {
	gameEngine: GameEngine
	userState: UserState
}
