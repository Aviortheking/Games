import GameEngine from 'GameEngine'
import Collider from './2D/Collider'
import Checker from './2D/Collider/Checker'
import Vector2D from './2D/Vector2D'
import Component2D, { ComponentState } from './Component2D'

export default class Scene {
	public static scenes: Record<string, Scene> = {}

	public background?: string
	public id: string

	public position: Vector2D = new Vector2D(0)
	public scale = 1
	public components: Array<Component2D> = []

	private componentsInitialized: Array<boolean> = []
	private ge!: GameEngine
	private hasClickedComponent: number | undefined

	public constructor(sceneId: string) {
		Scene.scenes[sceneId] = this
		this.id = sceneId
	}

	public addComponent(...cp: Array<Component2D>) {
		this.componentsInitialized.push(...cp.map(() => false))
		return this.components.push(...cp)
	}

	public getComponents(): Array<Component2D> {
		return this.components
	}

	/**
	 * delete the component
	 * @param component the component
	 */
	public removeComponent(component: Component2D): Scene
	/**
	 * delete the component by it's index
	 * @param component the component index
	 */
	public removeComponent(component: number | Component2D): Scene {
		if (typeof component === 'number') {
			this.components.splice(component, 1)
			this.componentsInitialized.splice(component, 1)
			return this
		}

		const index = this.components.findIndex((it) => it.id === component.id)
		if (index > -1) {
			this.components.splice(index, 1)
			this.componentsInitialized.splice(index, 1)
		}

		return this
	}

	public setGameEngine(ge: GameEngine) {
		this.ge = ge
	}

	public async init() {
		for await (const component of this.components) {
			await this.initComponent(component)
		}
	}

	// private count = 0

	public async update() {
		// console.log('new scene frame', this.count++)
		for await (const component of this.components) {
			await this.initComponent(component)
			await this.updateComponent(component)
		}
		for await (const component of this.components) {
			await this.renderComponent(component)
		}
	}

	public async destroy() {
		for await (const component of this.components) {
			await this.destroyComponent(component)
		}
	}

	// eslint-disable-next-line complexity
	public checkColisions(component: Component2D, exclusion?: Array<Component2D>): Array<Component2D> {
		const list: Array<Component2D> = []
		if (!component.collider) {
			return list
		}
		for (const otherComponent of this.components) {
			if (
				!otherComponent ||
				otherComponent.id === component.id ||
				!otherComponent.collider
			) {
				continue
			}

			// Exclude components from being checked
			if (exclusion?.find((it) => it.id === otherComponent.id)) {
				continue
			}

			if (component.collider) {
				component.collider.component = component
			}

			if (otherComponent.collider) {
				otherComponent.collider.component = otherComponent
			}

			// Check for collision
			if (
				Checker.detectCollision(component.collider, otherComponent.collider)
			) {
				list.push(otherComponent)
			}
		}
		return list
	}

	private async initComponent(component: Component2D) {
		if (component.state.isInitialized) {
			return
		}
		if (component.init) {
			await component?.init()
		}
		component.setState('isInitialized', true)

		if (component.childs) {
			for await (const child of component.childs) {
				child.parent = component
				await this.initComponent(child)
			}
		}
	}

	/**
	 * Update a specific component
	 *
	 * note: It first update the childs THEN the component
	 *
	 * @param component the component to update
	 * @returns the list of components to exclude in collision check
	 */
	private async updateComponent(component: Component2D): Promise<Array<Component2D>> {
		const debug = component.debug
		if (debug) {
			console.group('updating:', component.name, component.id)
		}

		// update childs first
		const toExclude: Array<Component2D> = []
		if (component.childs && component.childs.length > 0) {
			for await (const child of component.childs) {
				toExclude.push(...await this.updateComponent(child))
			}
		}

		const state: Partial<ComponentState> = {
			collideWith: [],
			scene: this
		}

		state.collideWith = this.checkColisions(component, toExclude)
		if (debug) {
			console.debug('collider [collisions, excludedCollisions]', state.collideWith.length, toExclude.length)
		}

		if (this.hasClickedComponent === component.id && !state.isColliding) {
			this.hasClickedComponent = undefined
		}

		if (component.update) {
			if (debug) {
				console.log('Updating component')
			}
			component.update(state as ComponentState)
		} else if (debug) {
			console.log('Component has no updater')
		}

		if (component.debug) {
			console.groupEnd()
		}

		return toExclude
	}

	private async renderComponent(component: Component2D) {
		const debug = component.debug
		if (debug) {
			console.group('rendering: ', component.name, component.id)
		}
		if (component.renderer) {
			if (debug) {
				console.log('rendering!')
			}
			// console.log('is rendering new element')
			await component.renderer.render(this.ge, this.ge.ctx)
		} else if (debug) {
			console.log('component has no renderer')
		}

		if (component.childs && component.childs.length > 0) {
			for await (const child of component.childs) {
				child.parent = component
				await this.renderComponent(child)
			}
		}
		if (component.debug) {
			console.groupEnd()
		}
	}

	private async destroyComponent(component: Component2D) {
		for await (const child of component.childs) {
			await this.destroyComponent(child)
		}
		await component.destroy?.()
	}
}
