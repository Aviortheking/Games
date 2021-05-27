import { Button, Table, Text, Util, NotificationManager, Col, Row } from '@dzeio/components'
import React, { MouseEvent as ReactMouseEvent } from 'react'
import css from './pokemon-shuffle.module.styl'

interface Cell {
	id: number
	id2: number
	horizontalCombo?: true
	verticalCombo?: true
	justSpawned?: true
	isFalling?: true
}

interface States {
	items: Array<Array<Cell | undefined>>
	loading?: true
	movingItem?: {x: number, y: number, cell: Cell}
	damage: number
	turn: number
	combo: number
	comboMax: number
	cursorPos: {x: number, y: number}
	boss: {
		hp: number
		id: number
	}
}

// up by 1 because of `1`
const ITEM_COUNT = 2 + 1
const BOARD_SIZE = 6
let n = BOARD_SIZE

export default class PokemonShuffle extends React.Component<unknown, States> {

	public state: States = {
		items: [[]],
		damage: 0,
		turn: 0,
		combo: 0,
		comboMax: 0,
		cursorPos: {x: 0, y: 0},
		boss: {
			hp: 10e3,
			id: 2
		}
	}

	public async componentDidMount() {
		await this.start()
		this.setState({
			comboMax: parseInt(window.localStorage.getItem('pokemon-shuffle/comboMax') ?? '0', 10)
		})
	}

	public render = () => (
		<main>
			<ul>
				<li><Text>Tour: {this.state.turn}</Text></li>
				<li><Text>Combo: {this.state.combo}, Max: {this.state.comboMax}</Text></li>
				<li><Text>Points: {this.state.damage}</Text></li>
			</ul>
			<Row align="center" >
				<Col>
					<Row direction="column" justify="center" align="center" >
						<Col nogrow>
							<Text className={Util.buildClassName(
								css[`icon-${this.state.boss.id}`],
								css.cell,
								css.noAnimation,
								css.boss
							)}>
							</Text>
						</Col>
						<Col nogrow>
							<div className={css.bossBar}>
								<div>
									<div style={{width: `${Math.max(0, 100 - (100 * this.state.damage / this.state.boss.hp))}%`}}></div>
								</div>
							</div>
						</Col>
					</Row>
				</Col>
				<Col>
					<table style={{margin: 'auto'}} className={css.table}>
						<tbody className={Util.buildClassName(css.table, [css.loading, this.state.loading])}>
							{this.state.items.map((row, y) => (
								<tr key={y}>
									{row.map((cell, x) => (
										<td
											key={cell?.id2 ?? x}
											onClick={this.onCellClick(x, y)}
											className={css.cellParent}
										>
											{/* <Text>{JSON.stringify(cell)}</Text> */}
											{cell && (
												<Text className={Util.buildClassName(
													css[`icon-${cell.id}`],
													css.cell,
													[css.isFalling, cell.isFalling],
													[css.justSpawned, cell.justSpawned],
													[css.explode, cell.horizontalCombo || cell.verticalCombo]
												)}>
												</Text>
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>

				</Col>
			</Row>
			<Button onClick={this.start}>Start!</Button>
			{this.state.movingItem && (
				<div className={css.hoverItem} style={{
					left: this.state.cursorPos.x,
					top: this.state.cursorPos.y
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
				<li><Text>Faire que les clear ce fasse de manière Async</Text></li>
				<li><Text>Utiliser le système de damages de Pokémon Shuffle https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Shuffle#Damage</Text></li>
				<li><Text>Mode VS (Voir si on fait en local et/ou en ligne avec le Websocket)</Text></li>
				<li><Text>Système de classement en ligne (maybe avec un compte pour eviter lees hackers lol)</Text></li>
				<li><Text>Combat de boss a la Pokémon Shuffle lol</Text></li>
			</ul>
			<NotificationManager />
		</main>
	)

	private mouveMove = (ev: MouseEvent) => {
		this.setState({cursorPos: {
			x: ev.clientX,
			y: ev.clientY
		}})
	}

	private start = async () => {
		if (this.state.loading) {return}
		await this.asyncSetState({
			loading: true,
			// generate datas
			items: Array
				.from(Array(BOARD_SIZE))
				.map(
					() => Array.from(Array(BOARD_SIZE))
						.map(() => ({id: random(0, ITEM_COUNT), id2: n++}))
				)
		})
		// Quickly calculate everythings to make it look like it was perfecly generated
		await this.calculate(true)
		this.setState({turn: 1, damage: 0, comboMax: 0, combo: 0})
	}

	private onCellClick = (x: number, y: number) => async (ev: ReactMouseEvent) => {
		if (this.state.loading) {
			return NotificationManager.addNotification('Cant play while Calculating')
		}
		if (!this.state.movingItem) {
			const cell = this.state.items[y][x]
			if (!cell) {
				return NotificationManager.addNotification('Cant move nothing')
			}
			document.addEventListener('mousemove', this.mouveMove)
			this.setState({movingItem: {x,y,cell}})
			this.state.items[y][x] = undefined
			this.mouveMove(ev.nativeEvent)
			return
		} else {
			document.removeEventListener('mousemove', this.mouveMove)
			const items = this.state.items
			const temp = items[y][x]
			console.log(temp, this.state.movingItem)
			items[y][x] = this.state.movingItem.cell
			const tmpX = this.state.movingItem.x
			const tmpY = this.state.movingItem.y
			if (temp) {
				items[tmpY][tmpX] = temp
			}
			this.setState({
				movingItem: undefined,
				loading: true,
				items
			}, async () => {
				const revert = !await this.calculate()
				if (revert) {
					const movingItem = items[y][x]
					items[y][x] = temp
					items[tmpY][tmpX] = movingItem
					this.setState({
						items,
						turn: this.state.turn - 1
					})
				}
			})

		}
	}

	private asyncSetState = (states: Partial<States>) => new Promise<void>(
		(res) => this.setState(states as States, () => res())
	)

	/**
	 * Check if items has combos
	 * @returns if items were changed
	 */
	private async checkup(initial: boolean): Promise<boolean> {
		const items = this.state.items
		let checkupCount = 0
		let newPoints = 0
		for (let y = 0; y < items.length; y++) {
			const row = items[y]
			for (let x = 0; x < row.length; x++) {
				const cell = row[x]
				if (!cell) {continue}
				const id = cell.id
				// Checkup horizontal
				if (!cell.horizontalCombo && !(cell.isFalling || cell.justSpawned)) {
					let sameCount = 0
					while((x + ++sameCount) < items.length) {
						// console.log(y + sameCount, x)
						const tmp = row[x + sameCount]
						if (!tmp || tmp.id !== id || tmp.isFalling || tmp.justSpawned) {break}
					}
					if (sameCount >= 3) {
						checkupCount += 1
						let len = 0
						for (let i = x; i < (x + sameCount); i++) {
							const tmp = items[y][i]
							if (!tmp) {continue}
							tmp.horizontalCombo = true
							len++
						}
						newPoints += calculateScore(len, this.state.combo)

					}
				}
				// Checkup Vertical
				if (!cell.verticalCombo && !(cell.isFalling || cell.justSpawned)) {
					let sameCount = 0
					while((y + ++sameCount) < items.length) {
						// console.log(y + sameCount, x)
						const tmp = items[y + sameCount][x]
						if (!tmp || tmp.id !== id || tmp.isFalling || tmp.justSpawned) {break}
					}
					if (sameCount >= 3) {
						checkupCount += 1
						let len = 0
						for (let i = y; i < (y + sameCount); i++) {
							const tmp = items[i][x]
							if (!tmp) {continue}
							tmp.verticalCombo = true
							len++
						}
						newPoints += calculateScore(len, this.state.combo)
						// console.log(x, y)
					}
				}
			}
		}

		// If combos were found
		if (checkupCount) {
			const combo = this.state.combo + checkupCount
			const comboMax = Math.max(this.state.comboMax, combo)
			if (comboMax === combo && !initial) {
				window.localStorage.setItem('pokemon-shuffle/comboMax', comboMax.toString())
			}
			await this.asyncSetState({
				items,
				damage: this.state.damage + newPoints,
				combo,
				comboMax
			})
		}
		return !!checkupCount
	}

	private async endTurn(state?: Partial<States>) {
		await this.asyncSetState({...state, loading: undefined, turn: this.state.turn + 1, combo: 0})
	}

	private async calculate(initial = false) {
		// remove combos
		const items = this.state.items.map((r) => r.map((c) => {
			if (!c) {
				return c
			}
			delete c.horizontalCombo
			delete c.verticalCombo
			return c
		}))

		let needContinue = false
		let hadTurn = false
		do {
			// Make items fall
			needContinue = false
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
						needContinue = true
						// Move cell down
						items[y+1][x] = cell
						items[y][x] = undefined
					}
				}
			}

			// Fill the top lane
			for (let x = 0; x < items[0].length; x++) {
				const cell = items[0][x]
				if (!cell) {
					needContinue = true
					items[0][x] = {id: random(0, ITEM_COUNT), id2: n++, justSpawned: true}
				}
			}

			// Need to wait for the falling animation
			if (needContinue) {
				await this.asyncSetState({items})
				if (!initial) {
					await wait(300)
				}
			}

			// Checkup if there is combos
			const checkup = await this.checkup(initial)
			if (!checkup && !needContinue) {
				await this.endTurn({items})
				break
			}

			// Clear items
			let hasCleared = false
			for (const row of items) {
				for (let x = 0; x < row.length; x++) {
					const cell = row[x]
					if (!cell || (!cell.horizontalCombo && !cell.verticalCombo)) {continue}
					row[x] = undefined
					hasCleared = true
					needContinue = true
				}
			}

			if (hasCleared && !initial) {
				await wait(500)
			}
			hadTurn = true

		} while (needContinue)
		return hadTurn
	}
}

function calculateScore(len: number, combo: number) {
	let score = (len - 2) * 40 // currently the damage
	if (len > 3) {
		switch (len) {
		case 4:
			score *= 1.5
			break
		case 5:
			score *= 2
			break
		case 6:
			score *= 3
			break
		default:
			break
		}
	}
	if (combo > 1) {
		if (combo >= 2 && combo <= 4) {
			score *= 1.1
		}
		if (combo >= 5 && combo <= 9) {
			score *= 1.1
		}
		if (combo >= 10 && combo <= 24) {
			score *= 1.2
		}
		if (combo >= 25 && combo <= 49) {
			score *= 1.3
		}
		if (combo >= 50 && combo <= 74) {
			score *= 1.4
		}
		if (combo >= 75 && combo <= 99) {
			score *= 1.5
		}
		if (combo >= 100 && combo <= 199) {
			score *= 2
		}
		if (combo >= 200) {
			score *= 2.5
		}
	}
	return score
}

function random(min = 0, max = 100): number {
	const r = Math.floor(Math.random() * (max - min) + min)
	// dont return 1 as it is the `?`
	if (r === 1) {
		return random(min, max)
	}
	return r
}

function wait(time: number): Promise<void> {
	return new Promise((res) => setTimeout(() => res(), time))
}
