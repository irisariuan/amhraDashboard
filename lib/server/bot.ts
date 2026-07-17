// Server-side helper for talking to the Amhra bot API. API_URL already includes
// the `/api` prefix (e.g. http://localhost:5001/api).
const BOT_API = process.env.API_URL ?? "http://localhost:5001/api"

export function botUrl(path: string): string {
	return `${BOT_API}${path.startsWith("/") ? path : `/${path}`}`
}

interface BotRequestInit {
	method?: string
	body?: BodyInit | null
	auth?: string | null
	contentType?: string | null
}

/** Forwards a request to the bot, attaching an Authorization header if given. */
export function botFetch(path: string, init: BotRequestInit = {}) {
	const headers: Record<string, string> = {}
	if (init.auth) headers.Authorization = init.auth
	if (init.contentType) headers["Content-Type"] = init.contentType
	return fetch(botUrl(path), {
		method: init.method ?? "GET",
		headers,
		body: init.body,
		cache: "no-store",
	})
}
