import { globalState } from '..'
import GameEngine from '../../../GameEngine'
import BoxCollider2D from '../../../GameEngine/2D/Collider/BoxCollider2D'
import ColliderDebugger from '../../../GameEngine/2D/Debug/ColliderDebugger'
import Vector2D from '../../../GameEngine/2D/Vector2D'
import Component2D, { type ComponentState } from '../../../GameEngine/Component2D'
import Cursor from '../../../GameEngine/Components/Cursor'
import RectRenderer from '../../../GameEngine/Renderer/RectRenderer'

export default class Start extends Component2D {
	public override renderer: RectRenderer = new RectRenderer(this, {material: 'yellow'})
	public override position: Vector2D = new Vector2D(0.5, 1)
	public override scale: Vector2D = new Vector2D(2, 1)
	public override collider: BoxCollider2D = new BoxCollider2D(this, {
		tags: 'cursor'
	})
	public override childs: Array<Component2D> = [new ColliderDebugger()]

	public override async update(state: ComponentState) {
		const cursor = (state.collisions?.find((it) => it.component instanceof Cursor))?.component as Cursor | undefined
		if (!cursor) {
			return
		}
		if (cursor.leftBtn.wasDown && !cursor.leftBtn.isDown) {
			console.log('Start Game !')
			await GameEngine.getGameEngine().setScene('TicTacToe')
			globalState.isPlaying = true
		}
	}
}
