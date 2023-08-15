import { globalState } from '.'
import GameEngine from '../../GameEngine'
import BoxCollider2D from '../../GameEngine/2D/Collider/BoxCollider2D'
import ColliderDebugger from '../../GameEngine/2D/Debug/ColliderDebugger'
import PointDebugger from '../../GameEngine/2D/Debug/PointDebugger'
import Vector2D from '../../GameEngine/2D/Vector2D'
import Asset from '../../GameEngine/Asset'
import Component2D, { type ComponentState } from '../../GameEngine/Component2D'
import Cursor from '../../GameEngine/Components/Cursor'
import TileRenderer from '../../GameEngine/Renderer/TileRenderer'
import SoundManager from '../../GameEngine/SoundManager'
import Tileset from '../../GameEngine/Tileset'
import { Explosion } from './Explosion'

export default class Item extends Component2D {

	public static explosion = new Explosion()

	public override collider: BoxCollider2D = new BoxCollider2D(this, {
		tags: 'cursor'
	})

	private x: number
	private y: number

	private tileset = new Tileset(Asset.init('/assets/tictactoe/swsh.png'), {
		fileSize: {width: 64, height: 32},
		tileSize: 32
	})


	public constructor(index: number) {
		super()
		this.x = Math.trunc(index % 3)
		this.y = Math.trunc(index / 3)
		this.position = new Vector2D(
			this.x + 0.025 * this.x,
			this.y + 0.025 * this.y
		)
		this.scale = new Vector2D(
			.95, .95
		)
		// this.renderer = new RectRenderer(this, {material: 'green'})
		this.renderer = new TileRenderer(this, {tileset: this.tileset, id: -1})
		// console.log(this.tileset.getSourceData(0), this.tileset.width(0), this.tileset.height(0))
		// console.log(this.tileset.getSourceData(1))
		this.childs = [
			new ColliderDebugger(),
			new PointDebugger({
				point: this.collider.pos()[0],
				size: .1
			}),
			new PointDebugger({
				point: this.collider.pos()[1],
				color: 'green',
				size: .1
			})
		]
		// console.log(index)
	}

	public override async update(state: ComponentState) {
		if (!globalState.isPlaying) {
			return
		}
		// console.log(state)
		const cursor = state.collisions?.find((it) => it.component instanceof Cursor)?.component as Cursor | undefined
		const value: '' | 'X' | 'O' = globalState.gameState?.[this.x]?.[this.y] as '' | 'X' | 'O'
		if (!cursor?.isDown && cursor?.wasDown) {
			// console.log('hovering')
			await this.onClick()
		}

		if (value === 'X') {
			this.renderer?.setProps({id: 1})
			// this.renderer = new ImageRenderer(this, Asset.init('/assets/tictactoe/X.png'))
		} else if(value === 'O') {
			this.renderer?.setProps({id: 0})
		} else {
			this.renderer?.setProps({id: -1})
		}
	}

	private async onClick() {
		console.log(this.position)
		const clickSound = new SoundManager('/assets/tictactoe/bip.wav')
		clickSound.play()
		globalState.gameState![this.x]![this.y] = globalState.playerTurn
		console.log(this.checkVictory())
		if (this.checkVictory()) {
			Item.explosion.run(this.position)
			globalState.gameState = [
				['', '', ''],
				['', '', ''],
				['', '', '']
			]
			console.log(globalState)
			await GameEngine.getGameEngine().setScene('Menu')
			return
		}
		globalState.playerTurn = globalState.playerTurn === 'X' ? 'O' : 'X'
	}

	// uh MAYBE refactor lol
	private checkVictory() {
		if(globalState.gameState[0][0] === globalState.playerTurn) {
			if(globalState.gameState[1][0] === globalState.playerTurn) {
				if(globalState.gameState[2][0] === globalState.playerTurn) {
					return true
				}
			}
			if(globalState.gameState[0][1] === globalState.playerTurn) {
				if(globalState.gameState[0][2] === globalState.playerTurn) {
					return true
				}
			}
			if(globalState.gameState[1][1] === globalState.playerTurn) {
				if(globalState.gameState[2][2] === globalState.playerTurn) {
					return true
				}
			}
		}
		if(globalState.gameState[2][2] === globalState.playerTurn) {
			if(globalState.gameState[2][1] === globalState.playerTurn) {
				if(globalState.gameState[2][0] === globalState.playerTurn) {
					return true
				}
			}
			if(globalState.gameState[1][2] === globalState.playerTurn) {
				if(globalState.gameState[0][2] === globalState.playerTurn) {
					return true
				}
			}
		}
		if(globalState.gameState[1][1] === globalState.playerTurn) {
			if(globalState.gameState[0][1] === globalState.playerTurn) {
				if(globalState.gameState[2][1] === globalState.playerTurn) {
					return true
				}
			}
			if(globalState.gameState[1][0] === globalState.playerTurn) {
				if(globalState.gameState[1][2] === globalState.playerTurn) {
					return true
				}
			}
		}
		return false
	}
}
