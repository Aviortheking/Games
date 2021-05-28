// V1.1.1 - Added futures blurry Placeholder and left optimizedLoading enabled
// Updated to commit from 2021-05-18
// https://github.com/vercel/next.js/commits/canary/packages/next/next-server/server/config-shared.ts
/**
 * @type {import("next/dist/next-server/server/config-shared").NextConfig & import("next/dist/next-server/server/config-shared").defaultConfig}
 */
 const nextConfig = {
	// Experimentals
	experimental: {
		plugins: true,
		profiling: process.env.NODE_ENV === 'developpment',
		sprFlushToDisk: true,
		workerThreads: true,

		pageEnv: true,
		optimizeImages: true,
		optimizeCss: true,

		scrollRestoration: true,
		scriptLoader: true,
		stats: process.env.NODE_ENV === 'developpment',
		externalDir: true,

		serialWebpackBuild: true,

		conformance: true,

		turboMode: true,
		eslint: true,
		// Bugged
		// https://github.com/vercel/next.js/issues/18913
		// reactRoot: true,
		enableBlurryPlaceholder: true,
		disableOptimizedLoading: false,
	},

	// Non experimental config
	// target: 'serverless',
	poweredByHeader: false,
	trailingSlash: false,
	optimizeFonts: true,
	reactStrictMode: true,

	// Futures
	future: {
		webpack5: true,
		strictPostcssConfiguration: true,
		excludeDefaultMomentLocales: true
	},

	// Headers and rewrites
	async headers() {
		// CSS no CSP, x-xss-protection
		const CSP = {
			key: 'Content-Security-Policy',
			value:
				// default-src is set to self because prefetch-src is not working propelly see: https://bugs.chromium.org/p/chromium/issues/detail?id=801561
				"default-src 'self'; " +
				"frame-ancestors 'none'; " +
				"form-action 'self'; " +
				"manifest-src 'self'; " +
				"prefetch-src 'self'; " +
				"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://proxy.dzeio.com; " +
				"style-src 'self' 'unsafe-inline'; " +
				"img-src data: 'self'; " +
				"font-src 'self'; " +
				"connect-src 'self' https://proxy.dzeio.com; " +
				"base-uri 'self';"
		}
		const XXssProtection = {
			key: 'X-XSS-Protection',
			value: '1; mode=block'
		}
		// JS no x-xss-protection

		const headers = [{
			key: 'X-Frame-Options',
			value: 'DENY'
		}, {
			key: 'X-Content-Type-Options',
			value: 'nosniff'
		}, {
			key: 'Referrer-Policy',
			value: 'strict-origin-when-cross-origin'
		}, {
			key: 'Permissions-Policy',
			value: 'geolocation=(), microphone=(), interest-cohort=()'
		}, {
			key: 'Strict-Transport-Security',
			value: 'max-age=63072000; includeSubDomains; preload'
		}, {
			key: 'X-Download-Options',
			value: 'noopen'
		}, {
			key: 'Expect-CT',
			value: 'max-age=86400, enforce'
		}]
		const excludedExtensions = ['js', 'css', 'json', 'ico', 'png']
			.map((ext) => `(?!\\.${ext}$)`).join('|')
		return [{
			source: `/:path*((?!^\\/_next\\/image)|${excludedExtensions})`,
			headers: [...headers, XXssProtection, CSP]
		}, {
			source: '/',
			headers: [...headers, XXssProtection, CSP]
		}, {
			// No CSP, XXssProtection
			source: `/:path*(\\.${excludedExtensions}$)`,
			headers: headers
		}, {
			// No CSP, XXssProtection
			source: '/_next/image',
			headers: headers
		}]
	},
}
module.exports = nextConfig
