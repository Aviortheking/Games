import { GetServerSideProps } from 'next'
import Sitemap from 'easy-sitemap'

export default class SitemapXml {}

export const getServerSideProps: GetServerSideProps = async ({res}) => {
	const sitemap = new Sitemap('https://games.avior.me', {response: res})
	sitemap.addEntry('/')
	sitemap.addEntry('/pokemon-shuffle')
	sitemap.addEntry('/tictactoe')
	sitemap.build()
	return {
		notFound: true
	}
}
