// Add support for Stylus/LESS
const preCSS = require('next-pre-css')
// Use Compose plugin for easier maintenance
const withPlugins = require('next-compose-plugins')

const {PHASE_DEVELOPMENT_SERVER} = require('next/constants')
const nextConfig = require('./dzeio.next.config')

module.exports = withPlugins([
		[preCSS, {
			cssModules: true,
			cssLoaderOptions: {
				localIdentName: "[hash:base64:6]",
			},
			[PHASE_DEVELOPMENT_SERVER]: {
				cssLoaderOptions: {
					localIdentName: "[path][name]__[local]"
				}
			}
		}]
	],
	//nextConfig
)
