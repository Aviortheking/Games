/* eslint-disable max-classes-per-file */
import GameEngine, { Component2D, ComponentState, Scene, SoundManager } from 'GameEngine'

const globalState: {
	playerTurn: 'X' | 'O'
	gameState: [
		[string, string, string],
		[string, string, string],
		[string, string, string],
	]
} = {
	playerTurn: 'X',
	gameState: [
		['', '', ''],
		['', '', ''],
		['', '', '']
	]
}

class Item extends Component2D {

	public size = {
		width: .9,
		height: .9
	}

	private x: number
	private y: number

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
			this.display = {
				type: 'image',
				source: '/assets/tictactoe/X.png'
			}
		} else if(value === 'O') {
			this.display = {
				type: 'image',
				source: '/assets/tictactoe/O.png'
			}
		}
	}

	private onClick() {
		const clickSound = new SoundManager('/assets/tictactoe/bip.wav')
		clickSound.play()
		globalState.gameState[this.x][this.y] = globalState.playerTurn
		console.log(this.checkVictory())
		if (this.checkVictory()) {
			new SoundManager('/assets/tictactoe/victory.wav').play()
			// globalState.gameState = [
			// 	['', '', ''],
			// 	['', '', ''],
			// 	['', '', '']
			// ]
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

class Line extends Component2D {

	public constructor(direction: number, index: number) {
		super()
		this.display = {
			type: 'color',
			source: 'orange'
		}
		this.pos = {
			x: direction ? index ? 1.95 : .9 : 0,
			y: direction ? 0 : index ? .9 : 1.95
		}
		this.size = {
			width: direction ? .15 : 3,
			height: direction ? 3 : .15
		}
	}

}

const ge = new GameEngine('#test', {
	caseCount: 3,
	background: 'blue'
})
const scene = new Scene('TicTacToe')
scene.addComponent(
	...Array.from(new Array(2)).map((_, index) => new Line(0, index)),
	...Array.from(new Array(2)).map((_, index) => new Line(1, index)),
	...Array.from(new Array(9)).map((_, index) => new Item(index)),
)

ge.start()
ge.setScene(scene)
