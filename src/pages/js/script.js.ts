import type { APIRoute } from 'astro'

/**
 * Plausible proxy
 */
export const get: APIRoute = async () => {
	const res = await fetch('https://plausible.io/js/script.file-downloads.outbound-links.js')
	return {
		status: 200,
		body: await res.text()
	}
}
