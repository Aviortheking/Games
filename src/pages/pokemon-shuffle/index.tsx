import { Button, Table, Text, Util } from '@dzeio/components'
import React from 'react'
import css from './pokemon-shuffle.styl'

interface Cell {
	id: number
	horizontalCombo?: true
	verticalCombo?: true
	justSpawned?: true
	isFalling?: true
}

interface States {
	items: Array<Array<Cell | undefined>>
	loading?: true
	movingItem?: {x: number, y: number, cell: Cell}
	points: number
	turn: number
	combo: number
	comboMax: number
	cursorPos: {x: number, y: number}
}

const ITEM_COUNT = 4
const BOARD_SIZE = 6
let n = BOARD_SIZE

export default class PokemonShuffle extends React.Component<unknown, States> {

	public state: States = {
		items: [[]],
		points: 0,
		turn: 0,
		combo: 0,
		comboMax: 0,
		cursorPos: {x: 0, y: 0}
	}

	public render = () => (
		<main>
			<ul>
				<li><Text>Tour: {this.state.turn}</Text></li>
				<li><Text>Combo: {this.state.combo}, Max: {this.state.comboMax}</Text></li>
				<li><Text>Points: {this.state.points}</Text></li>
			</ul>
			<Table >
				<tbody className={`${css.table} ${this.state.loading ? css.loading : ''}`}>
					{this.state.items.map((row, y) => (
						<tr key={y}>
							{row.map((cell, x) => (
								<td
									key={cell?.isFalling ? n++ : x}
									onClick={this.onCellClick(x, y)}
									className={css.cellParent}
								>
									{cell && (
										<Text className={Util.buildClassName(
											css[`icon-${cell.id}`],
											css.cell,
											[css.isFalling, cell.isFalling],
											[css.justSpawned, cell.justSpawned],
											[css.explode, cell.horizontalCombo || cell.verticalCombo]
										)}>
											<div></div>
										</Text>
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</Table>
			<Button onClick={() => this.calculate()}>Calculate!</Button>
			<Button onClick={() => this.start()}>Start!</Button>
			{/* <Input block type="textarea" value={JSON.stringify(this.state.items)}/> */}
			{this.state.movingItem && (
				<div style={{
					position: 'absolute',
					left: this.state.cursorPos.x,
					top: this.state.cursorPos.y,
					transform: 'translate(-50%, -50%)',
					pointerEvents: 'none'
				}}>
					<Text className={Util.buildClassName(css[`icon-${this.state.movingItem.cell?.id}`], css.cell)}>
						<div></div>
					</Text>
				</div>
			)}
			<Text>
				TODO list:
			</Text>
			<ul>
				<li><Text>Lancement Initial sans combo possible</Text></li>
				<li><Text>Meilleurs Animation de destruction</Text></li>
				<li><Text>Annuler le mouvement si rien n&apos;est claim</Text></li>
			</ul>
		</main>
	)

	private mouveMove = (ev: MouseEvent) => {
		this.setState({cursorPos: {
			x: ev.pageX,
			y: ev.pageY
		}})
	}

	private start() {
		if (this.state.loading) {return}
		this.setState({
			loading: true,
			items: Array
				.from(Array(BOARD_SIZE))
				.map(
					() => Array.from(Array(BOARD_SIZE))
						.map(() => ({id: random(0, ITEM_COUNT)}))
				)
		}, () => this.calculate())
	}

	private onCellClick = (x: number, y: number) => async () => {
		// console.log(x, y)
		if (this.state.loading) {
			return window.alert('Cant play while Calculating')
		}
		if (!this.state.movingItem) {
			const cell = this.state.items[y][x]
			if (!cell) {
				return window.alert('Cant move nothing')
			}
			document.addEventListener('mousemove', this.mouveMove)
			this.setState({movingItem: {x,y,cell}})
			this.state.items[y][x] = undefined
			return
		} else {
			document.removeEventListener('mousemove', this.mouveMove)
			const items = this.state.items
			const temp = items[y][x]
			items[y][x] = this.state.movingItem.cell
			items[this.state.movingItem.y][this.state.movingItem.x] = temp
			this.setState({
				movingItem: undefined,
				loading: true,
				items
			}, () => this.calculate())

		}
	}

	private asyncSetState = (states: Partial<States>) => new Promise<void>(
		(res) => this.setState(states as States, () => res())
	)

	private async calculate() {
		const items = this.state.items.map((r) => r.map((c) => {
			if (!c) {
				return c
			}
			c.horizontalCombo = undefined
			c.verticalCombo = undefined
			return c
		}))

		let newPoints = 0

		let checkupCount = 0
		// Checkup horizontal
		for (let y = 0; y < items.length; y++) {
			const row = items[y]
			for (let x = 0; x < row.length; x++) {
				const cell = row[x]
				if (!cell || cell.horizontalCombo) {continue}
				const id = cell.id
				let sameCount = 0
				while((x + ++sameCount) < items.length) {
					console.log(y + sameCount, x)
					const tmp = row[x + sameCount]
					if (!tmp || tmp.id !== id) {break}
				}
				if (sameCount >= 3) {
					checkupCount += 1
					for (let i = x; i < (x + sameCount); i++) {
						const tmp = items[y][i]
						if (!tmp) {continue}
						tmp.horizontalCombo = true
						newPoints++
					}
				}
			}
		}

		// Check vertical
		for (let y = 0; y < items.length; y++) {
			const row = items[y]
			for (let x = 0; x < row.length; x++) {
				const cell = row[x]
				if (!cell || cell.verticalCombo) {continue}
				const id = cell.id
				let sameCount = 0
				while((y + ++sameCount) < items.length) {
					// console.log(y + sameCount, x)
					const tmp = items[y + sameCount][x]
					if (!tmp || tmp.id !== id) {break}
				}
				// if ((y + sameCount) > items.length) {
				// 	sameCount++
				// }
				if (sameCount >= 3) {
					checkupCount += 1
					for (let i = y; i < (y + sameCount); i++) {
						const tmp = items[i][x]
						if (!tmp) {continue}
						tmp.verticalCombo = true

						newPoints++
					}
					// console.log(x, y)
				}
			}
		}

		if (checkupCount) {
			await this.asyncSetState({
				items,
				points: this.state.points + newPoints,
				combo: this.state.combo+checkupCount,
				comboMax: Math.max(this.state.comboMax, this.state.combo+checkupCount)
			})
			await new Promise((res) => setTimeout(res, 500))
		}

		// return

		// Clear items
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let y = 0; y < items.length; y++) {
			const row = items[y]
			for (let x = 0; x < row.length; x++) {
				const cell = row[x]
				if (!cell || (!cell.horizontalCombo && !cell.verticalCombo)) {continue}
				items[y][x] = undefined
			}
		}

		let itemHasFallen = false
		let needNewTurn = false
		do {
			// Make items fall
			itemHasFallen = false
			for (let y = (items.length - 1); y >= 0; y--) {
				const row = items[y]
				for (let x = 0; x < row.length; x++) {
					const cell = row[x]
					if (cell) {
						cell.justSpawned = undefined
						cell.isFalling = undefined
					}
					if (cell && y+1 < row.length && !items[y+1][x]) {
						cell.isFalling = true
						needNewTurn = true
						itemHasFallen = true
						items[y+1][x] = cell
						items[y][x] = undefined
					}
				}
			}

			// Fill to top lane
			for (let x = 0; x < items[0].length; x++) {
				const cell = items[0][x]
				if (!cell) {
					itemHasFallen = true
					items[0][x] = {id: random(0, ITEM_COUNT), justSpawned: true}
				}
			}
			if (itemHasFallen) {
				await this.asyncSetState({items})
				await new Promise((res) => setTimeout(res, 300))
			}
		} while (itemHasFallen)

		// If an item has fallen re calculate
		if (needNewTurn) {
			this.setState({items}, () => this.calculate())
			return
		}
		this.setState({items, loading: undefined, turn: this.state.turn+1, combo: 0})
	}
}

function random(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min) + min)
}
