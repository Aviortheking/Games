import React from 'react'

import { Link, Text } from '@dzeio/components'

export default class Index extends React.Component {

	public render = () => (
		<main>
			<Text>
				<Link href="/pokemon-shuffle">Pokémon Shuffle</Link>
			</Text>
			<Text>
				<Link href="/tictactoe">TicTacToe mais ou il y a eu beaucoup trop de temps de passé sur le jeux</Link>
			</Text>
		</main>
	)
}
