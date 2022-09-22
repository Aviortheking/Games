/* eslint-disable max-classes-per-file */
import React from 'react'
import GameEngine from 'GameEngine'
import Scene from 'GameEngine/Scene'
import Item from 'games/tictactoe/Item'
import Line from 'games/tictactoe/Line'
import Start from 'games/tictactoe/Menu/Start'
import FPSCounter from 'GameEngine/Components/FPSCounter'
import ComponentDebug from 'GameEngine/2D/Debug/ComponentDebug'

export default class Snake extends React.PureComponent {

	public async componentDidMount() {
		const ge = new GameEngine('#test', {
			caseCount: 3,
			background: 'blue',
			debugColliders: true,
			goalFramerate: 30
		})
		const menuScene = new Scene('Menu')
		menuScene.addComponent(
			new Start(),
			new FPSCounter()
		)
		const scene = new Scene('TicTacToe')
		scene.addComponent(
			...Array.from(new Array(2)).map((_, index) => new Line(0, index)),
			...Array.from(new Array(2)).map((_, index) => new Line(1, index)),
			...Array.from(new Array(9)).map((_, index) => new Item(index)),
			Item.explosion,
			new FPSCounter()
			// new TilingDebugger()
		)

		await ge.setScene(menuScene)
		ge.start()
	}

	public render = () => (
		<>
			<canvas id="test" width="300" height="300"></canvas>
		</>
	)

}
