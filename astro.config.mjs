import { defineConfig } from 'astro/config'
import tailwind from "@astrojs/tailwind"
import node from "@astrojs/node"

// const faviconHook = {
// 	name: 'Favicon',
// 	hooks: {
// 		"astro:build:setup": async () => {
// 			await Manifest.create('./src/assets/favicon.png', {
// 				name: 'Template'
// 			})
// 		}
// 	}
// }

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind()],
	compressHTML: true,
	build: {
		assets: 'assets',
		inlineStylesheets: 'auto'
	},
	server: {
		host: true
	},
	trailingSlash: 'never',
	vite: {
		server: {
			watch: {
				// support WSL strange things
				usePolling: !!process.env.WSL_DISTRO_NAME
			}
		}
	},
	experimental: {
		assets: true
	},

	// Customizable depending on goal
	output: 'server',
	adapter: node({
		mode: "standalone"
	}),
	site: 'https://print.dzeio.com',
 })
