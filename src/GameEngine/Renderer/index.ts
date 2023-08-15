import { objectLoop } from '@dzeio/object-util'
import GameEngine from '..'
import Vector2D from '../2D/Vector2D'
import Component2D from '../Component2D'
import MathUtils from '../libs/MathUtils'

// eslint-disable-next-line @typescript-eslint/ban-types
export default abstract class Renderer<Props extends object = {}> {

	/**
	 * set the renderer in debug mode
	 */
	public debug = false

	public readonly props: Props

	protected readonly defaultProps: Partial<Props> = {}

	private oldProps?: Props
	private needUpdate = true

	public constructor(
		public readonly component: Component2D,
		props: Props = {} as Props
	) {
		this.props = {...this.defaultProps, ...props}
	}

	public setProps(newProps: Partial<Props>) {
		objectLoop(newProps as any, (value, obj) => {
			if (this.props[obj as keyof Props] === value) {
				return
			}
			this.props[obj as keyof Props] = value
			this.needUpdate = true
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public async render(_ge: GameEngine, _ctx: CanvasRenderingContext2D): Promise<void> {
		if (this.needUpdate) {
			this.onUpdate?.(this.oldProps ?? this.props)
			this.needUpdate = false
			this.oldProps = this.props
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
	public onUpdate?(oldProps: Props): void

	/**
	 * return the position of the component with the camera offset applied
	 * @param component the component to get the real position
	 * @returns the position with the camera offset applied
	 */
	protected getPosition(component: Component2D = this.component): Vector2D {
		const ge = GameEngine.getGameEngine()
		let originComponent = component
		while (originComponent.parent) {
			originComponent = originComponent.parent
		}
		const realPosition = component.getAbsolutePosition()
			.rotate(
				originComponent.getAbsolutePosition(),
				this.component.getAbsoluteRotation()
			)
			.sum(
				-(ge.currentScene?.position?.x ?? 0),
				-(ge.currentScene?.position?.y ?? 0)
			)

		return realPosition
	}

	/**
	 * transform the position of the object to the real position on the canvas
	 * @returns the position of the element and scale translated to the canvas positioning
	 */
	protected realPosition(): [number, number, number, number] {
		const position = this.getPosition()
		return [
			this.translateToCanvas('x', position.x),
			this.translateToCanvas('y', position.y),
			this.translateToCanvas('x', this.component.scale.x),
			this.translateToCanvas('y', this.component.scale.y)
		]
	}

	/**
	 * Rotate the component
	 *
	 * It needs to be closed by rotateFinish
	 * @param ctx the context
	 * @param rotation rotation in degrees
	 */
	protected rotateStart(ctx: CanvasRenderingContext2D, sizes: [number, number, number, number], rotation: number) {
		const radians = MathUtils.toRadians(rotation)
		ctx.setTransform(
			1, //        Horizontal Scaling
			0, //        Horizontal Skewing
			0, //        Vertical   Skewing
			1, //        Vertical   Scaling
			sizes[0], // Horizontal Moving
			sizes[1] //  Vertical   Moving
		)
		ctx.rotate(radians)
	}

	/**
	 *
	 * @param ctx the context
	 * @param ge the gmeEngine
	 * @param additionnalRotation additionnal rotation
	 * @returns x, y, width, height
	 */
	protected preRender(
		ctx: CanvasRenderingContext2D,
		ge: GameEngine,
		additionnalRotation = 0
	): [number, number, number, number] {
		let position = this.realPosition()

		this.rotateStart(
			ctx,
			position,
			this.component.getAbsoluteRotation() + additionnalRotation
		)

		position = [
			0,
			0,
			position[2],
			position[3]
		]

		return position
	}

	protected postRender(ctx: CanvasRenderingContext2D, ge: GameEngine) {

		// handle rotation reset
		ctx.resetTransform()
	}

	/**
	 * @param ctx the context
	 */
	protected rotateFinish(ctx: CanvasRenderingContext2D) {
		ctx.resetTransform()
	}

	protected translateToCanvas(axis: 'x' | 'y', point: number): number {
		const ge = GameEngine.getGameEngine()
		const globalScale = ge.currentScene?.scale ?? 1
		return point * ge.caseSize[axis] * globalScale
	}
}
