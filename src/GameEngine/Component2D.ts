import BoxCollider2D from './2D/Collision/BoxCollider2D'
import Vector2D from './2D/Vector2D'
import Renderer from './Renderer'

export interface ComponentState {
	mouseHovering: boolean
	/**
	 * is it is collinding return the type of collision
	 */
	isColliding?: string
}

/**
 * 2D Component
 */
export default abstract class Component2D {

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
	 * @type {BoxCollider2D}
	 * @memberof Component2D
	 */
	public collider?: BoxCollider2D

	/**
	 * Change the origin point (default to middle)
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
	 * Function run when the component is initialized
	 */
	public init?(): Promise<void> | void

	/**
	 * Function run on each game ticks
	 * @param state the component state
	 */
	public update?(state: ComponentState): Promise<void> | void

	public destroy?(): Promise<void> | void
}
