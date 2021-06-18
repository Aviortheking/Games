export const globalState: {
	playerTurn: 'X' | 'O'
	gameState: [
		[string, string, string],
		[string, string, string],
		[string, string, string],
	]
	isPlaying: boolean
} = {
	playerTurn: 'X',
	gameState: [
		['', '', ''],
		['', '', ''],
		['', '', '']
	],
	isPlaying: false
}
