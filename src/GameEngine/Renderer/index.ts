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
		const realPosition = ge.currentScene.camera.topLeft.sum(this.component.position)
		return new Vector2D(
			realPosition.x - this.component.scale.x / 2 - this.component.origin.x,
			realPosition.y - this.component.scale.y / 2 - this.component.origin.y
		)
	}

	public abstract render(ge: GameEngine, ctx: CanvasRenderingContext2D): Promise<void>
}
