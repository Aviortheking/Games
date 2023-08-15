/* eslint-disable complexity */
import { objectLoop } from '@dzeio/object-util'
import GameEngine from '.'
import Collider from './2D/Collider'
import Vector2D from './2D/Vector2D'
import Renderer from './Renderer'
import Scene from './Scene'

/**
 * Component base Props
 *
 * it contains internal elements that manage how the component works
 *
 * it's elements are kept between frames
 */
export interface ComponentProps {
	// /**
	//  * Component unique ID
	//  */
	// id: number
	// /**
	//  * Component Renderer
	//  */
	// renderer?: Renderer
	zIndex?: number
	// position?: Vector2D
	// scale?: Vector2D
	// collider?: Collider | Array<Collider>
	// parent?: Component2D
	// origin?: Vector2D
	// childs?: Array<Component2D>
	// debug?: boolean
	// rotation?: number
	// enabled?: boolean

	scene?: Scene
	initialized?: boolean
}

/**
 * Component specific state
 * change for each frames
 */
export interface ComponentState {
	collisions?: Array<{
		collider: Collider
		component: Component2D
		tag: string | null | undefined
	}>

	/**
	 * define if a collision check has been done
	 */
	collisionChecked?: boolean
	collisionCheckNeeded?: boolean
	/**
	 * Temporary state containing the previous collision check position
	 */
	previousPosition?: Vector2D
}

/**
 * Component internal states definition
 *
 * TODO: Verify cache interest
 */
interface ComponentCache {
	absolutePosition?: {
		previousPosition?: Vector2D
		cacheResult?: Vector2D
		previousRotation?: number
	}
}

export type StaticComponent<
	Props extends {} | void = {} | void,
	Component extends Component2D<Props> = Component2D<Props>
> =
	new (props: Props | undefined) => Component

/**
 * 2D Component
 */
export default abstract class Component2D<
// eslint-disable-next-line @typescript-eslint/ban-types
T extends {} | void = {} | void
> {

	private static components = 0

	/**
	 * the component properties
	 */
	public readonly props: ComponentProps = {}

	/**
	 * Component specific state
	 * change for each frames
	 */
	public readonly state: ComponentState = {}

	/**
	 * unique number for the component
	 *
	 * maximum number of components is equal to Number.MAX_VALUE or 1.7976931348623157e+308
	 */
	public id: number = Component2D.components++

	/**
	 * Indicate how the component is rendered
	 *
	 * @type {Renderer}
	 * @memberof Component2D
	 */
	public renderer?: Renderer | null

	/**
	 * z Index to change the order of display
	 *
	 * (relative to parent if applicable)
	 */
	public zIndex?: number

	/**
	 * Component position relative to the parent position and to the component origin
	 *
	 * (see also: Component2D.origin)
	 *
	 * (relative to parent's position if applicatable)
	 *
	 * @type {Vector2D}
	 * @memberof Component2D
	 */
	public position: Vector2D = new Vector2D(0, 0)

	/**
	 * Component scale relative to 1 case size
	 *
	 * (relative to parent's position if applicatable)
	 *
	 * @type {Vector2D}
	 * @memberof Component2D
	 */
	public scale: Vector2D = new Vector2D(1, 1)

	/**
	 * Component collider for events
	 *
	 * @type {Collider}
	 * @memberof Component2D
	 */
	public collider: Collider | Array<Collider> | null = null

	/**
	 * Parent component of self is any
	 * this value is automatically set
	 *
	 * @type {Component2D}
	 * @memberof Component2D
	 */
	public parent?: Component2D

	/**
	 * Change the origin point (default to top left)
	 */
	public origin: Vector2D = new Vector2D(0 , 0)

	/**
	 * Component Child Components
	 *
	 * @type {Array<Component2D>}
	 * @memberof Component2D
	 */
	public childs: Array<Component2D> = []

	/**
	 * Component in debug mode
	 * It will display more informations depending on the Collider and other items
	 *
	 * note: Does not apply to childs components
	 *
	 * @type {boolean}
	 * @memberof Component2D
	 */
	public debug?: boolean

	/**
	 * Component rotation in Degrees
	 */
	public rotation = 0

	/**
	 * define if the component is enabled (update nor render is run if false)
	 */
	public enabled?: boolean = true

	protected params: T = {} as T

	private cache: ComponentCache = {}

	public constructor(it: T | void) {
		if (it) {
			this.params = it
		}
	}

	/**
	 * Change a property of the component
	 *
	 * @param newProps the new props for the component
	 */
	public setProps(newProps: Partial<ComponentProps>) {
		objectLoop(newProps, (value, obj) => {
			if (obj === 'zIndex') {
				this.zIndex = value as number
			}
			if (this.props[obj] === value) {
				return
			}
			this.props[obj] = value as any
		})
		return this
	}


	/**
	 * Function run when the component is initialized
	 */
	public init?(): Promise<void> | void

	/**
	 * Function run on each game ticks
	 * @param state the component state
	 */
	public update?(state: ComponentState): Promise<void> | void

	/**
	 * run just before the component is going to be destroyed
	 */
	public destroy?(): void


	/**
	 * get the element absolute position depending on it's rotation, origin and parent's absolute position
	 */
	public getAbsolutePosition(calculateRotation = true): Vector2D {
		let pos = this.position.sum(
			this.scale.multiply(this.origin)
		)

		if (this.parent) {
			pos = pos.sum(this.parent.getAbsolutePosition(calculateRotation))
		}

		const rotation = this.getAbsoluteRotation()
		if (this.cache.absolutePosition?.previousPosition && this.cache.absolutePosition.previousPosition.equal(pos) && this.cache.absolutePosition.previousRotation === rotation) {
			return this.cache.absolutePosition.cacheResult as Vector2D
		}

		if (this.rotation && calculateRotation) {
			const res = pos.rotate(this.getMiddle(true), this.getAbsoluteRotation())
			// FIXME: should not modify the component position here
			pos.set(res)
			this.cache.absolutePosition = {
				cacheResult: res,
				previousPosition: pos,
				previousRotation: rotation
			}
		}

		return pos
	}

	/**
	 * get the component's absolute rotation
	 * @returns the component's absolute rotation in degrees
	 */
	public getAbsoluteRotation(): number {
		if (this.parent) {
			return (this.parent.getAbsoluteRotation() + this.rotation) % 360
		}
		return (this.rotation + (GameEngine.getGameEngine().currentScene?.globalRotation ?? 0)) % 360
	}

	public getAbsoluteZIndex(): number {
		const zIndex = this.zIndex ?? 0
		if (this.parent) {
			return this.parent.getAbsoluteZIndex() + zIndex
		}
		return zIndex
	}

	public setState<K extends keyof ComponentState>(key: K, value: ComponentState[K]): void
	public setState(key: keyof ComponentState, value: any): void {
		this.state[key as keyof ComponentState] = value
	}

	public updateParam<K extends keyof T>(key: K, value: Component2D<T>['params'][K]): void {
		if (this.params[key] !== value) {
			this.params[key] = value
			this.onParamUpdated(key as string, value)
		}
	}

	public getParam<K extends keyof T>(key: K): Component2D<T>['params'][K]
	public getParam(key: string): any
	public getParam<K extends keyof T>(key: K | string): K | any {
		return this.params[key as keyof T]
	}

	public getParams(): Component2D<T>['params'] {
		return this.params
	}

	/**
	 * return the real width of the element (including rotation and all the shit)
	 */
	public getCalculatedWidth(): number {
		const radians = this.rotation * (Math.PI / 180)

		const rotatedWidth = Math.abs(this.scale.x * Math.cos(radians)) + Math.abs(this.scale.y * Math.sin(radians))
		return rotatedWidth
	}

	/**
	 * return the real width of the element (including rotation and all the shit)
	 */
	public getCalculatedHeight(): number {
		const radians = this.rotation * (Math.PI / 180)
		const rotatedWidth = Math.abs(this.scale.y * Math.cos(radians)) + Math.abs(this.scale.x * Math.sin(radians))
		return rotatedWidth
	}

	/**
	 * get the most top left position of the element
	 *
	 * if rotated it will give a point out of the element
	 *
	 * @param absolute give the relative or absolute position
	 * @returns the point in space in a relative or absolute position
	 */
	public calculateTopLeftPosition(absolute = false): Vector2D {
		return this.getMiddle(absolute).sub(
			this.getCalculatedWidth() / 2,
			this.getCalculatedHeight() / 2
		)
	}

	/**
	 * get the most bottom right position of the element
	 *
	 * if rotated it will give a point out of the element
	 *
	 * @param absolute give the relative or absolute position
	 * @returns the point in space in a relative or absolute position
	 */
	public calculateBottomRightPosition(absolute = false): Vector2D {
		return this.getMiddle(absolute).sum(
			this.getCalculatedWidth() / 2,
			this.getCalculatedHeight() / 2
		)
	}

	public calculatePositionFor(item: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', absolute = false) {
		let pos = this.position
		if (absolute && this.parent) {
			pos = this.getAbsolutePosition(false)
		}

		switch (item) {
			case 'topRight':
				pos = pos.sum(this.scale.x, 0)
				break
			case 'bottomLeft':
				pos = pos.sum(0, this.scale.y)
				break
			case 'bottomRight':
				pos = pos.sum(this.scale.x, this.scale.y)
				break
		}

		return pos.rotate(this.getMiddle(absolute), this.getAbsoluteRotation())
	}

	/**
	 * return the center point of the component
	 * @param absolute return the absolute position instead of the local position
	 *
	 * @returns the location of the middle of the component
	 */
	public getMiddle(absolute = false): Vector2D {
		if (absolute) {
			return this.getAbsolutePosition(false).sum(this.scale.div(2))
		}
		return this.position.sum(this.scale.div(2))
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	protected onParamUpdated(key: string, value: any) {}
}
