import { Text, Link } from '@dzeio/components'
import React from 'react'
export default class Snake extends React.PureComponent {
	public async componentDidMount() {
		await import('./Game')

	}
	public render = () => (
		<>
			<canvas id="test" width="300" height="300"></canvas>
			<Text>Bienvenue sur le TicTacToe le plus Overengineered du monde xd<br /> Avec un moteur de jeux complètement fait maison et bien plus encore en préparation ! (vieille version en 75 lignes, nouvelle en plus de 200 lol)</Text>
			<Text>Version faites il y a 4 ans encore disponible sur Github lol <Link href="https://github.com/Aviortheking/TicTacToe">https://github.com/Aviortheking/TicTacToe</Link></Text>
		</>
	)
}
