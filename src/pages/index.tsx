import React from 'react'

import { Link, Text } from '@dzeio/components'

export default class Index extends React.Component {

	public render = () => (
		<main>
			<Text>
				<Link href="/pokemon-shuffle">Pokémon Shuffle</Link>
			</Text>
		</main>
	)
}
