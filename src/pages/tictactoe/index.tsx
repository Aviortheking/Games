/* eslint-disable max-classes-per-file */
import React from 'react'
import { Text, Link } from '@dzeio/components'
import GameEngine from 'GameEngine'
import Scene from 'GameEngine/Scene'
import Item from 'games/tictactoe/Item'
import Line from 'games/tictactoe/Line'

export default class Snake extends React.PureComponent {

	public async componentDidMount() {
		const ge = new GameEngine('#test', {
			caseCount: 3,
			background: 'blue'
		})
		const scene = new Scene('TicTacToe')
		scene.addComponent(
			...Array.from(new Array(2)).map((_, index) => new Line(0, index)),
			...Array.from(new Array(2)).map((_, index) => new Line(1, index)),
			...Array.from(new Array(9)).map((_, index) => new Item(index)),
			Item.explosion
		)

		ge.start()
		ge.setScene(scene)
	}

	public render = () => (
		<>
			<canvas id="test" width="300" height="300"></canvas>
			<Text>Explositon animation from <Link href="https://opengameart.org/content/explosion-animations">https://opengameart.org/content/explosion-animations</Link></Text>
			<Text>Bienvenue sur le TicTacToe le plus Overengineered du monde xd<br /> Avec un moteur de jeux complètement fait maison et bien plus encore en préparation ! (vieille version en 75 lignes, nouvelle en plus de 200 lol)</Text>
			<Text>Version faites il y a 4 ans encore disponible sur Github lol <Link href="https://github.com/Aviortheking/TicTacToe">https://github.com/Aviortheking/TicTacToe</Link></Text>
		</>
	)

}
