import React from 'react'
import App from 'next/app'

import '@dzeio/components/style.css'

export default class CApp extends App {

	public render() {
		const { Component, pageProps } = this.props

		return(<Component {...pageProps} />)
	}
}
