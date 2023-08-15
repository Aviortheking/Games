import type { APIRoute } from 'astro'

/**
 * Plausible proxy
 */
export const post: APIRoute = async ({ request, clientAddress }) => {
	// const body = await request.json()
	// console.log(body, clientAddress)
	const res = await fetch('https://plausible.io/api/event', {
		method: 'POST',
		headers: {
			'User-Agent': request.headers.get('User-Agent') as string,
			'X-Forwarded-For': clientAddress,
			'Content-Type': 'application/json'
		},
		body: await request.text()
	})
	return {
		status: res.status,
		body: await res.text()
	}
}
