import GameEngine from 'GameEngine'
import AssetsManager from './Asset'
import Camera from './Camera'
import Component2D, { ComponentState } from './Component2D'

export default class Scene {
	public static scenes: Record<string, Scene> = {}

	public background?: string
	public id: string

	public camera: Camera = new Camera()

	private components: Array<Component2D> = []
	private ge!: GameEngine


	public constructor(sceneId: string) {
		Scene.scenes[sceneId] = this
		this.id = sceneId
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
		for (const component of this.components) {
			await this.updateComponent(component)
		}
	}

	private async updateComponent(v: Component2D) {
		const debug = v.debug
		if (debug) {
			console.log('Processing Component', v)
		}
		const state: Partial<ComponentState> = {}
		// const width = (v.width() ?? 1) * this.ge.caseSize[0]
		// const height = (v.height() ?? 1) * this.ge.caseSize[1]
		if (v.collider && v.collider.type === 'click' && this.ge.cursor.isDown && !this.ge.cursor.wasDown) {
			if (v.collider.pointColliding(this.ge.cursor.position, 'click')) {
				state.isColliding = 'click'
			}
		}
		// if (v.pos) {
		// 	const ax = v.pos.x * this.ge.caseSize[0]
		// 	const ay = v.pos.y * this.ge.caseSize[1]
		// 	state.mouseHovering =
		// 		this.ge.cursor.x >= ax && this.ge.cursor.x < (ax + width) &&
		// 		this.ge.cursor.y >= ay && this.ge.cursor.y < (ay + height)
		// 	state.mouseClicking = state.mouseHovering && this.ge.cursor.isDown
		// 	state.mouseClicked = state.mouseClicking && !this.ge.cursor.wasDown
		// }
		if (v.renderer) {
			if (debug) {
				console.log('Rendering Component', v)
			}
			// console.log('is rendering new element')
			await v.renderer.render(this.ge, this.ge.ctx)
		}
		if (v.update) {
			if (debug) {
				console.log('Updating Component', v)
			}
			v.update(state as ComponentState)
		}
		if (v.childs) {
			if (debug) {
				console.log('Processing childs', v)
			}
			for (const child of v.childs) {
				await this.updateComponent(child)
			}
		}
	}
}
