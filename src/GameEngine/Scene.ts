import GameEngine from 'GameEngine'
import { ComponentState } from 'react'
import AssetsManager from './Asset'
import Component2D from './Component2D'

export default class Scene {
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
			if (v.renderer) {
				await v.renderer.render(this.ge, this.ge.ctx)
			}
			if (v.update) {
				v.update(state as ComponentState)
			}
		})
	}
}
