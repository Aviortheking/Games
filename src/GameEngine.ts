/* eslint-disable max-classes-per-file */
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


export class SoundManager {
	private audio: HTMLAudioElement
	public constructor(path: string) {
		this.audio = new Audio(path)
		this.audio.load()
		this.audio.volume = .8
	}

	public play() {
		this.audio.play()
	}

	public end() {
		this.audio.pause()
	}
}

export class AssetsManager {

	public static assets: Record<string, AssetsManager> = {}

	public isLoaded = false

	private image: HTMLImageElement

	private constructor(
		private path: string
	) {
		this.image = new Image()
	}

	public static init(path: string) {
		if (!this.assets[path]) {
			this.assets[path] = new AssetsManager(path)
		}
		return this.assets[path]
	}

	public async load() {
		return new Promise<void>((res, rej) => {
			this.image.src = this.path
			this.image.onload = () => {
				this.isLoaded = true
				res()
			}
		})
	}

	public async get() {
		if (!this.isLoaded) {
			await this.load()
		}
		return this.image
	}
}

export class Scene {
	public static scenes: Record<string, Scene> = {}

	public background?: string

	private components: Array<Component2D> = []
	private ge!: GameEngine

	public constructor(sceneId: string) {
		Scene.scenes[sceneId] = this
	}

	public addComponent(...cp: Array<Component2D>) {
		return this.components.push(...cp)
	}

	public setGameEngine(ge: GameEngine) {
		this.ge = ge
	}

	public async init() {
		this.components.forEach((v) => {
			if (v.init) {
				v.init()
			}
		})
	}

	public async update() {
		this.components.forEach(async (v) => {
			const state: Partial<ComponentState> = {}
			const width = (v.size?.width ?? 1) * this.ge.caseSize[0]
			const height = (v.size?.height ?? 1) * this.ge.caseSize[1]
			if (v.pos) {
				const ax = v.pos.x * this.ge.caseSize[0]
				const ay = v.pos.y * this.ge.caseSize[1]
				state.mouseHovering =
					this.ge.cursor.x >= ax && this.ge.cursor.x < (ax + width) &&
					this.ge.cursor.y >= ay && this.ge.cursor.y < (ay + height)
				state.mouseClicking = state.mouseHovering && this.ge.cursor.isDown
				state.mouseClicked = state.mouseClicking && !this.ge.cursor.wasDown
			}
			if (v.display && v.pos) {
				const ax = v.pos.x * this.ge.caseSize[0]
				const ay = v.pos.y * this.ge.caseSize[1]
				if (v.display.type === 'color') {
					this.ge.ctx.fillStyle = v.display.source
					this.ge.ctx.fillRect(
						ax,
						ay,
						width,
						height
					)
				} else if (v.display.type === 'image') {
					this.ge.ctx.drawImage(
						await AssetsManager.init(v.display.source).get(),
						ax,
						ay,
						width,
						height
					)
				}
			}
			if (v.update) {
				v.update(state as ComponentState)
			}
		})
	}
}

export interface ComponentState {
	mouseHovering: boolean
	mouseClicking: boolean
	mouseClicked: boolean
}

export abstract class Component2D {
	public id?: number
	public display?: {
		type: 'image' | 'color'
		source: string
	}
	public pos?: {x: number, y: number, z?: number, rotation?: number}
	public size?: {width: number, height: number}

	public init?(): Promise<void> | void

	public update?(state: ComponentState): Promise<void> | void
}
