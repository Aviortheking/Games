import GameEngine from 'GameEngine'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'

// eslint-disable-next-line @typescript-eslint/ban-types
export default abstract class Renderer {
	public constructor(
		protected component: Component2D
	) {}

	protected getPosition(component?: Component2D): Vector2D {

		const ge = GameEngine.getGameEngine()
		const realPosition = (component ?? this.component).getAbsolutePosition().sum(
			-(ge.currentScene?.position?.x ?? 0),
			-(ge.currentScene?.position?.y ?? 0)
		)

		return realPosition
	}

	protected realPosition(ge: GameEngine): [number, number, number, number] {
		const position = this.getPosition()
		const globalScale = ge.currentScene?.scale ?? 1
		return [
			position.x * ge.caseSize.x * globalScale,
			position.y * ge.caseSize.y * globalScale,
			this.component.scale.x * ge.caseSize.x * globalScale,
			this.component.scale.y * ge.caseSize.y * globalScale
		]
	}

	protected selfPosition(ge: GameEngine): [number, number, number, number] {
		const position = this.component.position
		const globalScale = ge.currentScene?.scale ?? 1
		return [
			position.x * ge.caseSize.x * globalScale,
			position.y * ge.caseSize.y * globalScale,
			(this.component.scale.x ?? ge.caseSize.x) * ge.caseSize.x * globalScale,
			(this.component.scale.y ?? ge.caseSize.y) * ge.caseSize.y * globalScale
		]
	}

	protected parentRealPosition(ge: GameEngine): [number, number, number, number] {
		const parent = this.component.parent
		if (!parent) {
			return [
				0,0,0,0
			]
		}
		const position = this.getPosition(parent)
		const globalScale = ge.currentScene?.scale ?? 1
		return [
			position.x * ge.caseSize.x * globalScale,
			position.y * ge.caseSize.y * globalScale,
			(parent.scale.x ?? ge.caseSize.x) * ge.caseSize.x * globalScale,
			(this.component.scale.y ?? ge.caseSize.y) * ge.caseSize.y * globalScale
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
		const radians = rotation * Math.PI / 180
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

	protected preRender(
		ctx: CanvasRenderingContext2D,
		ge: GameEngine,
		additionnalRotation = 0
	): [number, number, number, number] {
		let position = this.realPosition(ge)

		if (this.component.getAbsoluteRotation() !== 0 || additionnalRotation) {
			this.rotateStart(
				ctx,
				this.component.parent ? this.parentRealPosition(ge) : position,
				this.component.getAbsoluteRotation() + additionnalRotation
			)
			position = this.component.parent ? this.selfPosition(ge) : [0, 0, position[2], position[3]]
		}

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

	public abstract render(ge: GameEngine, ctx: CanvasRenderingContext2D): Promise<void>
}
