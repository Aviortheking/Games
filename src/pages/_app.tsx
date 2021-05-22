import React from 'react'
import App from 'next/app'

import PlausibleProvider from 'next-plausible'
import '@dzeio/components/style.css'

export default class CApp extends App {

	public render() {
		const { Component, pageProps } = this.props

		return (
			<PlausibleProvider
				customDomain="stats.dzeio.com"
				domain="games.avior.me"
				trackOutboundLinks
				integrity="sha384-Bwk7iNMK9H56PgZeINNhN5Mk42LZoNIXe6Ztx5lfALsrTkNWC9yh2J2UFO0xShAv"
			>
				<Component {...pageProps} />
			</PlausibleProvider>
		)
	}
}
