interface ApiOptions {
	method?: "GET" | "POST"
	body?: unknown
	cache?: RequestCache
	/** Aborts the request, for searches superseded by newer keystrokes */
	signal?: AbortSignal
}

/**
 * Fetches a same-origin `/api/*` route. Authentication rides on the httpOnly
 * session/anonymous cookie, which same-origin requests send automatically — the
 * route handlers under app/api attach it to the bot request. No token is ever
 * handled in the browser.
 */
export function apiFetch(
	path: string,
	options: ApiOptions = {},
): Promise<Response> {
	const hasBody = options.body !== undefined
	return fetch(path, {
		method: options.method ?? "GET",
		headers: hasBody ? { "Content-Type": "application/json" } : undefined,
		body: hasBody ? JSON.stringify(options.body) : undefined,
		cache: options.cache,
		signal: options.signal,
	})
}
