import { type Session, authHeader } from "@/lib/session"

interface ApiOptions {
	method?: "GET" | "POST"
	body?: unknown
	cache?: RequestCache
}

/**
 * All `/api/*` paths are proxied to the bot server by the rewrite in
 * next.config.mjs. This wrapper only adds the Authorization header in the
 * format the backend expects for the session's credential type.
 */
export function apiFetch(
	path: string,
	session: Session,
	options: ApiOptions = {},
): Promise<Response> {
	const hasBody = options.body !== undefined
	return fetch(path, {
		method: options.method ?? "GET",
		headers: {
			Authorization: authHeader(session),
			...(hasBody ? { "Content-Type": "application/json" } : {}),
		},
		body: hasBody ? JSON.stringify(options.body) : undefined,
		cache: options.cache,
	})
}
