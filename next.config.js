const stylus = require('@zeit/next-stylus')
const css = require('@zeit/next-css')
const withPlugins = require('next-compose-plugins')
const {PHASE_DEVELOPMENT_SERVER} = require('next/constants')

module.exports = withPlugins([
		[stylus, {
			cssModules: true,
			cssLoaderOptions: {
				localIdentName: "[hash:base64:6]",
			},
			[PHASE_DEVELOPMENT_SERVER]: {
				cssLoaderOptions: {
					localIdentName: "[path][name]__[local]"
				}
			}
		}],
		[css, {
			cssModules: false
		}]
	]
)
