import React from 'react'
import App from 'next/app'

import PlausibleProvider from 'next-plausible'

export default class CApp extends App {

	public render() {
		const { Component, pageProps } = this.props

		return (
			<PlausibleProvider
				enabled
				customDomain="https://proxy.dzeio.com"
				domain="games.avior.me"
				integrity="sha256-R6vN8jmBq9SIpnfJRnw9eNUfLbC2yO3GPQAKR5ZS7zQ="
			>
				<Component {...pageProps} />
			</PlausibleProvider>
		)
	}
}
