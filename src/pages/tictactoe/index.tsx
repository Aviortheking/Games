import { Text, Link } from '@dzeio/components'
import GameEngine, { Scene } from 'GameEngine'
import React from 'react'
import { Item, Line } from '../../games/tictactoe'
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
		)

		ge.start()
		ge.setScene(scene)
	}
	public render = () => (
		<>
			<canvas id="test" width="300" height="300"></canvas>
			<Text>Bienvenue sur le TicTacToe le plus Overengineered du monde xd<br /> Avec un moteur de jeux complètement fait maison et bien plus encore en préparation ! (vieille version en 75 lignes, nouvelle en plus de 200 lol)</Text>
			<Text>Version faites il y a 4 ans encore disponible sur Github lol <Link href="https://github.com/Aviortheking/TicTacToe">https://github.com/Aviortheking/TicTacToe</Link></Text>
		</>
	)
}
