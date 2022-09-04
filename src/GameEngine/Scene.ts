import GameEngine from 'GameEngine'
import Camera from './Components/Camera'
import Component2D, { ComponentState } from './Component2D'

export default class Scene {
	public static scenes: Record<string, Scene> = {}

	public background?: string
	public id: string

	public camera: Camera = new Camera()

	private components: Array<Component2D> = []
	private ge!: GameEngine
	private hasClickedComponent: number | undefined


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
		for (let index = 0; index < this.components.length; index++) {
			const component = this.components[index];
			await this.updateComponent(component, index)
		}
	}

	public async destroy() {
		for await (const component of this.components) {
			await component.destroy?.()
		}
	}

	private async updateComponent(v: Component2D, index: number) {
		const debug = v.debug
		if (debug) {
			console.log('Processing Component', v)
		}
		const state: Partial<ComponentState> = {}
		// const width = (v.width() ?? 1) * this.ge.caseSize[0]
		// const height = (v.height() ?? 1) * this.ge.caseSize[1]
		if (v.collider && v.collider.type === 'click' && (this.hasClickedComponent === index || !this.hasClickedComponent)) {
			if (v.collider.pointColliding(this.ge.cursor.position, 'click')) {
				if (this.ge.cursor.isDown && !this.ge.cursor.wasDown) {
					state.isColliding = 'click'
					this.hasClickedComponent = index
				} else if (this.ge.cursor.isDown) {
					state.isColliding = 'down'
					this.hasClickedComponent = index
				}
			}
		}
		if (this.hasClickedComponent === index && !state.isColliding) {
			this.hasClickedComponent = undefined
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
		if (v.update) {
			if (debug) {
				console.log('Updating Component', v)
			}
			v.update(state as ComponentState)
		}

		if (v.renderer) {
			if (debug) {
				console.log('Rendering Component', v)
			}
			// console.log('is rendering new element')
			await v.renderer.render(this.ge, this.ge.ctx)
		}

		if (v.childs) {
			if (debug) {
				console.log('Processing childs', v)
			}
			for await (const child of v.childs) {
				await this.updateComponent(child)
			}
		}
	}
}
