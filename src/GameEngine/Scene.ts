/* eslint-disable max-len */
/* eslint-disable max-depth */
import Listener from '@dzeio/listener'
import GameEngine from '.'
import Checker from './2D/Collider/Checker'
import Vector2D from './2D/Vector2D'
import Component2D, { ComponentState } from './Component2D'
import Camera from './Components/Camera'

export default class Scene extends Listener<{
	componentAdded: (component: Component2D) => void
	componentRemoved: (component: Component2D) => void
}> {
	public static scenes: Record<string, Scene> = {}

	public background?: string
	public id: string

	public position: Vector2D = new Vector2D(0)
	public scale = 1
	public globalRotation = 0
	public components: Array<Component2D> = []
	public camera?: Camera

	public readonly updatePerformances: Record<string, number> = {
		preparation: -1,
		init: -1,
		collision: -1,
		update: -1,
		render: -1,
		total: -1
	}

	private componentsInitialized: Array<boolean> = []
	private ge!: GameEngine

	public constructor(sceneId: string) {
		super()
		Scene.scenes[sceneId] = this
		this.id = sceneId
	}

	public requireCamera() {
		if (!this.camera) {
			throw new Error('Camera not initialized')
		}
		return this.camera
	}

	public addComponent(...cp: Array<Component2D>) {
		if (!this.camera) {
			const cam = cp.find((it) => it instanceof Camera) as Camera | undefined
			this.camera = cam
		}
		this.componentsInitialized.push(...cp.map(() => false))
		const size = this.components.push(...cp)
		cp.forEach((it) => this.emit('componentAdded', it))
		return size
	}

	public addComponentAt(index: number, ...cp: Array<Component2D>) {
		if (!this.camera) {
			const cam = cp.find((it) => it instanceof Camera) as Camera | undefined
			this.camera = cam
		}
		const initStart = this.componentsInitialized.slice(0, index)
		const initEnd = this.componentsInitialized.slice(index)
		this.componentsInitialized = [...initStart, ...cp.map(() => false), ...initEnd]
		const start = this.components.slice(0, index)
		const end = this.components.slice(index)
		this.components = [...start, ...cp, ...end]
		cp.forEach((it) => this.emit('componentAdded', it))
	}

	public getComponents(): Array<Component2D> {
		return this.components
	}

	/**
	 * delete the component
	 * @param component the component or component's index
	 */
	public removeComponent(component: number | Component2D): Scene {
		component = typeof component !== 'number' ? this.components.findIndex((it) => it.id === (component as Component2D).id) : component
		if (component !== -1) {
			const cp = this.components.splice(component, 1)
			this.emit('componentRemoved', cp[0])
			this.componentsInitialized.splice(component, 1)
			cp[0].destroy?.()
		} else {
			console.warn('component not found')
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

	// private frameNumber = 0

	// eslint-disable-next-line complexity
	public async update() {
		// console.log('new scene frame', this.count++)

		let now = window.performance.now()
		const componentList = this.flattenComponents()
		this.updatePerformances.preparation = window.performance.now() - now

		now = window.performance.now()
		await Promise.all(this.components.map((it) => this.initComponent(it)))
		// for await (const component of this.components) {
		// 	await this.initComponent(component)
		// }
		this.updatePerformances.init = window.performance.now() - now

		// enabled && !checked && (!pPosition || diffPosition || checkNeeded)
		now = window.performance.now()
		const filterFn = (it: Component2D) =>
			it.enabled &&
			!it.state.collisionChecked &&
			(!it.state.previousPosition || !it.getAbsolutePosition().equal(it.state.previousPosition) || it.state.collisionCheckNeeded)
		let componentsToCheck: Array<Component2D> = componentList.filter(filterFn)
		let doWhileLimit = 0
		do {
			// console.log(componentsToCheck)
			const futureComponents: Array<Component2D> = []
			componentsToCheck.forEach((it) => {
				const collisions = this.checkColisions(it)
				const oldCollisions = it.state.collisions ?? []
				it.setState('previousPosition', it.getAbsolutePosition().clone())
				it.setState('collisionChecked', true)
				it.setState('collisions', collisions)
				if (oldCollisions.length > 0|| collisions.length > 0) {
					futureComponents.push(...[...oldCollisions, ...collisions].filter((coll) => !futureComponents.includes(coll.component)).map((coll) => {
						coll.component.setState('collisionCheckNeeded', true)
						return coll.component
					}))
				}
			})
			componentsToCheck = futureComponents.filter(filterFn)
		} while (componentsToCheck.length > 0 && doWhileLimit++ < componentList.length)
		this.updatePerformances.collision = window.performance.now() - now

		now = window.performance.now()
		for await (const component of componentList) {
			// const cpNow = window.performance.now()
			await this.updateComponent(component)
			// const time = window.performance.now() - cpNow
			// if (time > 0.15) {
			// 	this.updatePerformances[`cp-${component.id} ${component.constructor.name}`] = window.performance.now() - cpNow
			// }
		}
		componentList.forEach((it) => {
			it.setState('collisionCheckNeeded', false)
			it.setState('collisionChecked', false)
		})
		this.updatePerformances.update = window.performance.now() - now

		now = window.performance.now()
		const camera = this.camera
		if (!camera) {
			return
		}
		const camXY = camera.getAbsolutePosition(false)
		const camPos = [camXY.clone(), camera.getScale().sum(camXY)]

		const componentsToRender = componentList.filter((component) => {
			const selfXY = component.getAbsolutePosition(false)
			const selfPos = [selfXY, selfXY.sum(component.scale)]

			// basic check
			return selfPos[1].x >= camPos[0].x && // self bottom higher than other top
			selfPos[0].x <= camPos[1].x &&
			selfPos[1].y >= camPos[0].y &&
			selfPos[0].y <= camPos[1].y
		}).sort((a, b) => a.getAbsoluteZIndex() - b.getAbsoluteZIndex())

		for await (const component of componentsToRender) {
			await this.renderComponent(component)
		}
		this.updatePerformances.render = window.performance.now() - now
		this.updatePerformances.total =
			this.updatePerformances.preparation +
			this.updatePerformances.collision +
			this.updatePerformances.update +
			this.updatePerformances.render
	}

	public destroy() {
		for (const component of this.components) {
			this.destroyComponent(component)
		}
	}

	public flattenComponents(): Array<Component2D> {
		return this.components.map(this.flattenComponent).flat()
	}

	public orderComponentsByZIndex(): Array<Component2D> {
		return this.flattenComponents().sort((a, b) => a.getAbsoluteZIndex() - b.getAbsoluteZIndex())
	}

	// eslint-disable-next-line complexity
	public checkColisions(component: Component2D): NonNullable<Component2D['state']['collisions']> {
		if (!component.collider || !component.enabled) {
			return []
		}

		const list: Component2D['state']['collisions'] = []

		for (const otherComponent of this.flattenComponents()) {
			if (
				!otherComponent.enabled ||
				otherComponent.id === component.id ||
				!otherComponent.collider
			) {
				continue
			}

			const colliders = Array.isArray(component.collider) ? component.collider : [component.collider]
			const otherColliders = Array.isArray(otherComponent.collider) ? otherComponent.collider : [otherComponent.collider]

			for (const collider of colliders) {
				for (const otherCollider of otherColliders) {
					// Check for collision
					if (collider.tags === null || otherCollider.tags === null) {
						if (Checker.detectCollision(collider, otherCollider)) {
							const tags = Array.isArray(collider.tags) ? collider.tags : [collider.tags]
							for (const tag of tags) {
								list.push({
									collider: collider,
									component: otherComponent,
									tag: tag
								})
							}
						}
						continue
					}

					const colliderTypes: Array<string | undefined> = Array.isArray(collider.tags) ? collider.tags : [collider.tags]
					const otherColliderTypes: Array<string | undefined> = Array.isArray(otherCollider.tags) ? otherCollider.tags : [otherCollider.tags]

					const tagIdx = colliderTypes.filter((it) => otherColliderTypes.includes(it))
					if (
						tagIdx.length > 0 &&
						Checker.detectCollision(collider, otherCollider)
					) {
						for (const tag of tagIdx) {
							list.push({
								collider: collider,
								component: otherComponent,
								tag: tag
							})
						}
						continue
					}
				}
			}

		}
		return list
	}

	/**
	 * check if an element collide with a specific position
	 * @param vector the position to check
	 */
	public at(pos: Vector2D, hasCollider = true) {
		return this.components.filter((it) => {
			if (hasCollider && !it.collider) {
				return false
			}
			return pos.isIn(it.position, it.position.sum(it.scale))
		})
	}

	public in(pos: [Vector2D, Vector2D], hasCollider = true) {
		return this.components.filter((it) => {
			if (hasCollider && !it.collider) {
				return false
			}
			return Checker.posBoxBoxCollision(
				pos,
				[it.position, it.position.sum(it.scale)]
			)
		})
	}

	private flattenComponent = (component: Component2D): Array<Component2D> => {
		if (!component.enabled) {
			return []
		}
		if (!component.childs) {
			return [component]
		}
		return [component, ...component.childs.map(this.flattenComponent).flat()]
	}

	private async initComponent(component: Component2D) {
		if (component.props.initialized) {
			return
		}
		if (component.init) {
			await component?.init()
		}
		component.setProps({initialized: true})

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
	// eslint-disable-next-line complexity
	private async updateComponent(component: Component2D): Promise<void> {

		if (!component.enabled) {
			return
		}

		// update childs first
		// const toExclude: Array<Component2D> = []
		// if (component.childs && component.childs.length > 0) {
		// 	for await (const child of component.childs) {
		// 		toExclude.push(...await this.updateComponent(child))
		// 	}
		// }

		const state: Partial<ComponentState> = component.state

		component.setProps({scene: this})

		if (component.update) {
			return component.update(state as ComponentState)
		}
	}

	// eslint-disable-next-line complexity
	private async renderComponent(component: Component2D) {
		if (!component.enabled) {
			return
		}
		const debug = component.debug
		if (debug) {
			console.group('rendering: ', component.id)
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

		if (component.debug) {
			console.groupEnd()
		}
	}

	private destroyComponent(component: Component2D) {
		for (const child of component.childs) {
			this.destroyComponent(child)
		}
		component.destroy?.()
		component.setProps({initialized: false})
	}
}

/*
if (component.hasMoved) check collisions
update item
if (in camera) render it
*/
