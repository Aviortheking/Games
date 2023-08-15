import States from '../../libs/States'

export interface Cell {
	// cell pokemon ID
	id: number
	// is cell part of an horizontal combo
	horizontalCombo?: boolean
	// is cell part of a vertical combo
	verticalCombo?: boolean
	// has cell just spawned?
	justSpawned?: boolean
	// is cell falling
	isFalling?: boolean
}

export default class PokemonShuffle {
	public gameState: States<{
		cells: Array<Array<Cell | null>>
		// boss damages
		damage: number
	}> = new States({
		cells: [[]] as any,
		damage: 0
	})

	private comboMax: number = 0
	public constructor(
		private boardSize: number = 6,
		private pokemonCount: number = 5,
		public readonly boss: {
			health: number
			id: number
		}
	) {
		this.gameState.setProps({cells: this.generate()})
	}

	public async moveCell(from: [number, number], to: [number, number]) {

		// move cells
		const cellFrom = this.gameState.props.cells[from[0]]![from[1]] ?? null
		const cellTo = this.gameState.props.cells[to[0]]![to[1]] ?? null

		this.gameState.props.cells[from[0]]![from[1]] = cellTo
		this.gameState.props.cells[to[0]]![to[1]] = cellFrom


		// run the main loop
		let newScore = 0
		let runCheckLoop = true
		while (runCheckLoop) {
			const scoreMade = this.calculateGame()
			runCheckLoop = scoreMade > 0
			if (scoreMade > 0) {
				await this.updateGameState()
			}
			newScore += scoreMade
		}

		// revert if no combo were made
		if (newScore === 0) {
			this.gameState.props.cells[from[0]]![from[1]] = cellFrom
			this.gameState.props.cells[to[0]]![to[1]] = cellTo
		}
	}

	/**
	 * generate a new game
	 */
	private generate(): Array<Array<Cell | null>> {
		return Array
			.from(Array(this.boardSize))
			.map(
				() => Array.from(Array(this.boardSize))
					.map(() => ({ id: this.randomPokemon(0, this.pokemonCount) }))
			)
	}

	private randomPokemon(min = 0, max = 100): number {
		let id = -1
		do {
			id = Math.floor(Math.random() * (max - min) + min)
			// dont return 1 as it is the `?`
		} while (id < 0 || id === 1)
		return id
	}

	private async updateGameState() {
		// remove combos
		const cells = this.gameState.props.cells.map((row) => row.map((cell) => {
			if (!cell) {
				return null
			}
			return cell
		}))

		let needContinue = true
		let hadTurn = false
		while (needContinue) {
			console.log('running calculate')
			// Make items fall
			needContinue = false
			for (let rowIdx = (cells.length - 1); rowIdx >= 0; rowIdx--) {
				const row = cells[rowIdx] ?? []
				for (let colIdx = 0; colIdx < row.length; colIdx++) {
					const cell = row[colIdx]
					if (cell) {
						cell.justSpawned = false
						cell.isFalling = false
					}
					if (cell && rowIdx+1 < row.length && !cells[rowIdx+1]?.[colIdx]) {
						cell.isFalling = true
						needContinue = true
						console.log('making', rowIdx, colIdx, 'fall')
						// Move cell down
						cells![rowIdx+1]![colIdx] = cell
						cells![rowIdx]![colIdx] = null
					}
				}
			}

			// Fill the top lane
			for (let col = 0; col < cells[0]!.length; col++) {
				const cell = cells![0]![col]
				if (!cell) {
					console.log('filling to lane at', col)
					needContinue = true
					cells[0]![col] = {id: this.randomPokemon(0, this.pokemonCount), justSpawned: true}
				}
			}

			// Need to wait for the falling animation
			if (needContinue) {
				this.gameState.setProps({
					cells: cells,
					// hitBoss: false
				}, {force: true})
				await this.wait(300)
			}

			// Clear items
			let hasCleared = false
			for (const row of cells) {
				for (let colIdx = 0; colIdx < row.length; colIdx++) {
					const cell = row[colIdx]
					if (!cell || (!cell.horizontalCombo && !cell.verticalCombo)) {continue}
					row[colIdx] = null
					hasCleared = true
					needContinue = true
					console.log('clearing', colIdx)
				}
			}

			if (hasCleared/* && !initial*/) {
				await this.wait(500)
			}
			hadTurn = true
		}
		return hadTurn
	}

	private wait(time: number): Promise<void> {
		return new Promise((res) => setTimeout(() => res(), time))
	}

	private calculateGame() {
		const items = this.gameState.props.cells

		// the number of matches found
		let matches = 0

		// the score the calculation made
		let newPoints = 0

		// the current combo
		let combo = 0

		// loop through each rows
		for (let rowIdx = 0; rowIdx < items.length; rowIdx++) {
			const row = items[rowIdx] ?? []

			// loop through each cols
			for (let colIdx = 0; colIdx < row.length; colIdx++) {
				const cell = row[colIdx]

				// skip if there is no cell
				if (!cell) {
					continue
				}

				// get the pokemon ID
				const id = cell.id

				// Checkup combos horizontally
				if (!cell.horizontalCombo && !(cell.isFalling || cell.justSpawned)) {
					// the number of time it is seen
					let count = 0
					while((colIdx + ++count) < items.length) {
						// check the card below
						const tmp = row[colIdx + count]
						if (!tmp || tmp.id !== id || tmp.isFalling || tmp.justSpawned) {break}
					}
					if (count >= 3) {
						matches += 1
						for (let i = colIdx; i < (colIdx + count); i++) {
							const tmp = items[rowIdx]![i]
							if (!tmp) {continue}
							tmp.horizontalCombo = true
						}
						newPoints += this.calculateMatch(count, combo)
					}
				}
				// Checkup combos Vertical
				if (!cell.verticalCombo && !(cell.isFalling || cell.justSpawned)) {
					let count = 0
					while((rowIdx + ++count) < items.length) {
						const tmp = items[rowIdx + count]![colIdx]
						if (!tmp || tmp.id !== id || tmp.isFalling || tmp.justSpawned) {break}
					}
					if (count >= 3) {
						matches += 1
						for (let i = rowIdx; i < (rowIdx + count); i++) {
							const tmp = items[i]![colIdx]
							if (!tmp) {continue}
							tmp.verticalCombo = true
						}
						newPoints += this.calculateMatch(count, combo)
						// console.log(colIdx, rowIdx)
					}
				}
			}
		}

		// If combos were found
		if (matches) {
			combo += matches
			const comboMax = Math.max(this.comboMax, combo)
			// if (comboMax === combo && !initial) {
			// 	window.localStorage.setItem('pokemon-shuffle/comboMax', comboMax.toString())
			// }
			this.gameState.setProps({
				cells: items
				// damage: state.props.damage ?? 0 + newPoints,
				// combo,
				// comboMax,
				// hitBoss: true
			}, { force: true })
		}
		return newPoints
	}

	/**
	 * Calculate a score for a specific match
	 *
	 * @param len the length of the match
	 * @param combo the current combo count
	 * @returns the score for the specific match
	 */
	private calculateMatch(len: number, combo: number) {
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
				score *= 1.15
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
}
