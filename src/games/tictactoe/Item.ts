import GameEngine from 'GameEngine'
import BoxCollider2D from 'GameEngine/2D/Collider/BoxCollider2D'
import ColliderDebugger from 'GameEngine/2D/Debug/ColliderDebugger'
import PointDebugger from 'GameEngine/2D/Debug/PointDebugger'
import Vector2D from 'GameEngine/2D/Vector2D'
import Asset from 'GameEngine/Asset'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import RectRenderer from 'GameEngine/Renderer/RectRenderer'
import TileRenderer from 'GameEngine/Renderer/TileRenderer'
import SoundManager from 'GameEngine/SoundManager'
import Tileset from 'GameEngine/Tileset'
import { globalState } from '.'
import { Explosion } from './Explosion'

export default class Item extends Component2D {

	public static explosion = new Explosion()

	public name = 'Item'

	public collider: BoxCollider2D = new BoxCollider2D()

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
			this.x,
			this.y
		)
		this.scale = new Vector2D(
			.9, .9
		)
		// this.renderer = new RectRenderer(this, {material: 'green'})
		this.renderer = new TileRenderer(this, {tileset: this.tileset, id: -1})
		// console.log(this.tileset.getSourceData(0), this.tileset.width(0), this.tileset.height(0))
		// console.log(this.tileset.getSourceData(1))
		this.childs = [
			new ColliderDebugger(),
			new PointDebugger(this.collider.pos()[0]),
			new PointDebugger(this.collider.pos()[1])
		]
		// console.log(index)
	}

	public init() {
		console.log('item initialized')
	}

	public update(state: ComponentState) {
		if (!globalState.isPlaying) {
			return
		}
		// console.log(state)
		const value: '' | 'X' | 'O' = globalState.gameState[this.x][this.y] as '' | 'X' | 'O'
		if (state.isColliding === 'click' && value === '') {
			// console.log('hovering')
			this.onClick()
		}

		if (value === 'X') {
			(this.renderer as TileRenderer).id = 1
			// this.renderer = new ImageRenderer(this, Asset.init('/assets/tictactoe/X.png'))
		} else if(value === 'O') {
			(this.renderer as TileRenderer).id = 0
		} else {
			(this.renderer as TileRenderer).id = -1
		}
	}

	private onClick() {
		const clickSound = new SoundManager('/assets/tictactoe/bip.wav')
		clickSound.play()
		globalState.gameState[this.x][this.y] = globalState.playerTurn
		console.log(this.checkVictory())
		if (this.checkVictory()) {
			Item.explosion.run(this.position)
			globalState.gameState = [
				['', '', ''],
				['', '', ''],
				['', '', '']
			]
			console.log(globalState)
			GameEngine.getGameEngine().setScene('Menu')
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
