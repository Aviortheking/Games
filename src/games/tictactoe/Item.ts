import Asset from 'GameEngine/Asset'
import Component2D, { ComponentState } from 'GameEngine/Component2D'
import TileRenderer from 'GameEngine/Renderer/TileRenderer'
import SoundManager from 'GameEngine/SoundManager'
import Tileset from 'GameEngine/Tileset'
import { globalState } from '.'
import { Explosion } from './Explosion'

export default class Item extends Component2D {

	public static explosion = new Explosion()

	public size = {
		width: .9,
		height: .9
	}

	private x: number
	private y: number

	private tileset = new Tileset(Asset.init('/assets/pokemon-shuffle/icons.png'), {
		fileSize: {width: 3750, height: 3266},
		tileSize: 121
	})

	public constructor(index: number) {
		super()
		this.x = Math.trunc(index % 3)
		this.y = Math.trunc(index / 3)
		this.pos = {
			x: this.x + this.x * .05,
			y: this.y + this.y * .05
		}
		console.log(this.pos, index)
	}

	public init() {
		console.log('item initialized')
	}

	public update(state: ComponentState) {
		// console.log(state)
		const value: '' | 'X' | 'O' = globalState.gameState[this.x][this.y] as '' | 'X' | 'O'
		if (state.mouseClicked && value === '') {
			// console.log('hovering')
			this.onClick()
		}

		if (value === 'X') {
			this.renderer = new TileRenderer(this, this.tileset, 20)
			// this.renderer = new ImageRenderer(this, Asset.init('/assets/tictactoe/X.png'))
		} else if(value === 'O') {
			this.renderer = new TileRenderer(this, this.tileset, 54)
		}
	}

	private onClick() {
		const clickSound = new SoundManager('/assets/tictactoe/bip.wav')
		clickSound.play()
		globalState.gameState[this.x][this.y] = globalState.playerTurn
		console.log(this.checkVictory())
		if (this.checkVictory()) {
			Item.explosion.run(this.pos)
			globalState.gameState = [
				['', '', ''],
				['', '', ''],
				['', '', '']
			]
			console.log(globalState)
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
