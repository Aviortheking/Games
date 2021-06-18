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

export default abstract class Component2D {

	public renderer?: Renderer

	public position: Vector2D = new Vector2D(0, 0)

	public scale: Vector2D = new Vector2D(1, 1)

	public collider?: BoxCollider2D

	/**
	 * Change the origin point (default to middle)
	 */
	public origin: Vector2D = new Vector2D(0 , 0)

	public childs: Array<Component2D> = []

	public debug?: boolean

	public init?(): Promise<void> | void

	public update?(state: ComponentState): Promise<void> | void
}
