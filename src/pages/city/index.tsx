/* eslint-disable max-classes-per-file */
import React from 'react'
import { Text, Link } from '@dzeio/components'
import GameEngine from 'GameEngine'
import Scene from 'GameEngine/Scene'
import Item from 'games/tictactoe/Item'
import Line from 'games/tictactoe/Line'
import Start from 'games/tictactoe/Menu/Start'
import FPSCounter from 'GameEngine/Components/FPSCounter'
import ComponentDebug from 'GameEngine/2D/Debug/ComponentDebug'
import Tile from 'games/city/Tile'
import Space from 'games/city/Space'
import Vector2D from 'GameEngine/2D/Vector2D'
import Cursor from 'games/city/Cursor'

export default class Snake extends React.PureComponent {

	public async componentDidMount() {
		const ge = new GameEngine('#test', {
			caseCount: [208,104],
			debugColliders: true,
			goalFramerate: 60
		})
		const mainScene = new Scene('Menu')
		mainScene.camera.topLeft.x = 0
		mainScene.camera.topLeft.y = 0
		const cursor = new Cursor()

		// for (let ch = 0; ch < 104; ch++) {
		// 	for (let cw = 0; cw < 208; cw++) {
		// 		mainScene.addComponent(
		// 			new Tile(cw, ch)
		// 		)
		// 	}
		// }

		const placeableRects: Array<[Vector2D, Vector2D]> = [
			// top rect
			[new Vector2D(0, 0), new Vector2D(208, 18)],

			// left recet
			[new Vector2D(20, 28), new Vector2D(167, 79)],

			// right rect
			[new Vector2D(178,28), new Vector2D(208, 79)],
			// bottom rect
			[new Vector2D(0, 89), new Vector2D(208, 104)],


		]

		for (let i = 0; i < 10; i++) {
			const width = i % 2 === 0 ?  20 : 10
			const height = i % 2 === 0 ? 10 : 20
			const baseX = width / 2 + 1
			const baseY = i % 2 === 0 ? 50 : 70

			const it = new Space(new Vector2D(width, height), cursor, placeableRects)
			it.position.x = baseX
			it.position.y = baseY
			// it.debug = i === 0
			mainScene.addComponent(
				it
			)
		}

		// mainScene.addComponent(
		// 	// cursor,
		// 	new Space(new Vector2D(20, 10), cursor, placeableRects, true)
		// )

		await ge.setScene(mainScene)
		ge.start()
	}


	public render = () => (
		<>
			<canvas id="test" width="2080" height="1040" style={{backgroundImage: 'url(\'/assets/city/background.png\')'}}></canvas>
			<Text>
				<span id="debug"></span>
			</Text>
		</>
	)

	private randomInt(min: number, max: number): number {
		min = Math.ceil(min)
		max = Math.floor(max)
		return Math.floor(Math.random() * (max - min + 1)) + min
	}
}
