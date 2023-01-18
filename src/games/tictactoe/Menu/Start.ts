import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collider/BoxCollider2D'
import ColliderDebugger from 'GameEngine/2D/Debug/ColliderDebugger'
import Vector2D from 'GameEngine/2D/Vector2D'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import { globalState } from '..'

export default class Start extends Component2D {
	public name = 'Start'
	public renderer: RectRenderer = new RectRenderer(this, {material: 'yellow'})
	public position: Vector2D = new Vector2D(1, 1)
	public scale: Vector2D = new Vector2D(2, 1)
	public collider: BoxCollider2D = new BoxCollider2D()
	public childs: Array<Component2D> = [new ColliderDebugger()]

	public update(state: ComponentState) {
		if (state.collideWith?.find((it) => it.name === 'Cursor')) {
			console.log('Start Game !')
			GameEngine.getGameEngine().setScene('TicTacToe')
			globalState.isPlaying = true
		}
	}
}
