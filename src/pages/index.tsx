import { Link, Text } from '@dzeio/components'
import React from 'react'

export default class Index extends React.Component {

	public render = () => (
		<main>
			<Text>
				<Link href="/pokemon-shuffle">Pokémon Shuffle</Link>
			</Text>
		</main>
	)
}
