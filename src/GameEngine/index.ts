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
	public currentScene!: Scene
	private isRunning = false

	public constructor(
		private id: string,
		public options?: {
			caseCount?: number | [number, number]
			background?: string
			debugColliders?: boolean
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
		requestAnimationFrame(() => {
			this.update()
		})
		document.addEventListener('mousemove', (ev) => {
			this.cursor.position = new Vector2D(
				ev.clientX / this.caseSize.x - this.currentScene.camera.topLeft.x,
				ev.clientY / this.caseSize.y - this.currentScene.camera.topLeft.y
			)
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
		console.log('Setting scene', typeof scene === 'string' ? scene : scene.id)
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

export interface GameState<UserState = any> {
	gameEngine: GameEngine
	userState: UserState
}
