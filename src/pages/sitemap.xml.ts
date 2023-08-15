import type { APIRoute } from 'astro'
import Sitemap from 'easy-sitemap'

export const get: APIRoute = async () => {
	const sitemap = new Sitemap('https://games.avior.me')
	sitemap.addEntry('/')
	sitemap.addEntry('/pokemon-shuffle')
	sitemap.addEntry('/tictactoe')
	return {
		status: 200,
		body: sitemap.build()
	}
}
