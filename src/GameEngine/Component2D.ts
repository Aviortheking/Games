import Collider from './2D/Collider'
import Vector2D from './2D/Vector2D'
import Renderer from './Renderer'
import Scene from './Scene'

export interface ComponentState {
	mouseHovering?: boolean
	/**
	 * is it is colliding return the type of Collider
	 */
	isColliding?: string
	collideWith?: Array<Component2D>
	scene?: Scene
	isInitialized?: boolean
}

export type StaticComponent<
	// eslint-disable-next-line @typescript-eslint/ban-types
	T extends {} | void = {} | void,
	C extends Component2D<T> = Component2D<T>
> =
	new (params: T | undefined) => C

/**
 * 2D Component
 */
export default abstract class Component2D<
// eslint-disable-next-line @typescript-eslint/ban-types
T extends {} | void = {} | void
> {

	private static components = 0


	public state: ComponentState = {}

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
	public renderer?: Renderer

	/**
	 * Component position relative to the parent position and to the component origin
	 *
	 * (see also: Component2D.origin)
	 *
	 * @type {Vector2D}
	 * @memberof Component2D
	 */
	public position: Vector2D = new Vector2D(0, 0)

	/**
	 * Component scale relative to 1 case size
	 *
	 * (see also: GameEngine.caseSize)
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
	public collider?: Collider

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

	protected params: T = {} as T

	/**
	 * the name of the component
	 * used to detect components
	 */
	public abstract readonly name: string

	public constructor(it: T | void) {
		if (it) {
			this.params = it
		}
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

	public destroy?(): Promise<void> | void

	public getAbsolutePosition(calculateRotation = true): Vector2D {
		let pos = this.position.sum(
			this.scale.multiply(this.origin)
		)

		if (this.parent) {
			pos = pos.sum(this.parent.getAbsolutePosition(calculateRotation))
		}

		if (this.rotation && calculateRotation) {
			const middle = pos.clone().sum(this.scale.x / 2, this.scale.y / 2)
			const rot = this.rotation * (Math.PI / 180)
			const tmp = pos.clone().sum(-middle.x, -middle.y)
			return pos.set(
				middle.x + (tmp.x * Math.cos(rot) - tmp.y * Math.sin(rot)),
				middle.y + (tmp.x * Math.sin(rot) + tmp.y * Math.cos(rot))
			)
		}

		return pos
	}

	public getAbsoluteRotation(): number {
		if (this.parent) {
			return this.parent.getAbsoluteRotation() + this.rotation
		}
		return this.rotation
	}

	public setState(key: keyof ComponentState, value: any): void {
		(this.state[key] as typeof value) = value
	}

	public updateParam(key: keyof T, value: any): void {
		this.params[key] = value
	}

	public getParam(key: keyof T): any {
		return this.params[key]
	}
}
