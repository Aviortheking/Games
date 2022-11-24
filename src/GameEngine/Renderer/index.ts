import GameEngine from 'GameEngine'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D from 'GameEngine/Component2D'

// eslint-disable-next-line @typescript-eslint/ban-types
export default abstract class Renderer {
	public constructor(
		protected component: Component2D
	) {}

	protected getPosition(): Vector2D {
		const ge = GameEngine.getGameEngine()
		const realPosition = this.component.getAbsolutePosition().sum(
			-(ge.currentScene?.position?.x ?? 0),
			-(ge.currentScene?.position?.y ?? 0)
		)

		return realPosition
	}

	public abstract render(ge: GameEngine, ctx: CanvasRenderingContext2D): Promise<void>
}
