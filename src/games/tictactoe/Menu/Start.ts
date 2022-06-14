import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collision/BoxCollider2D'
import ColliderDebugger from 'GameEngine/2D/Debug/ColliderDebugger'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import { globalState } from '..'

export default class Start extends Component2D {
	public renderer: RectRenderer = new RectRenderer(this, {material: 'yellow'})
	public position: Vector2D = new Vector2D(1, 1)
	public scale: Vector2D = new Vector2D(2, 1)
	public collider: BoxCollider2D = new BoxCollider2D(this, 'click')
	public childs: Array<Component2D> = [new ColliderDebugger(this, this.collider)]

	private hasCollided = false

	public async update(state: ComponentState) {
		if (state.isColliding === 'click') {
			this.hasCollided = true
		} else if (this.hasCollided) {
			console.log('Start Game !')
			await GameEngine.getGameEngine().setScene('TicTacToe')
			globalState.isPlaying = true
			this.hasCollided = false
		}
	}
}
