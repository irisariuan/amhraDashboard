import { cookies } from "next/headers"

// The dashboard is the browser's only origin. Session and anonymous tokens live
// in httpOnly cookies here and are attached to bot requests by the proxy; the
// browser's JavaScript never sees them.
export const SESSION_COOKIE = "amhra_session"
export const ANON_COOKIE = "amhra_anon"

const THIRTY_DAYS = 60 * 60 * 24 * 30

function baseCookieOptions() {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	}
}

export async function setSessionCookie(token: string) {
	;(await cookies()).set(SESSION_COOKIE, token, {
		...baseCookieOptions(),
		maxAge: THIRTY_DAYS,
	})
}

export async function setAnonCookie(token: string) {
	;(await cookies()).set(ANON_COOKIE, token, {
		...baseCookieOptions(),
		maxAge: 60 * 60 * 6, // matches the anonymous account TTL
	})
}

export async function clearAuthCookies() {
	const store = await cookies()
	store.delete(SESSION_COOKIE)
	store.delete(ANON_COOKIE)
}

/**
 * Builds the Authorization header for a bot request from whichever auth cookie
 * is present. Session takes precedence over an anonymous token.
 */
export async function authHeaderFromCookies(): Promise<string | null> {
	const store = await cookies()
	const session = store.get(SESSION_COOKIE)?.value
	if (session) return `Session ${session}`
	const anon = store.get(ANON_COOKIE)?.value
	if (anon) return `Anon ${anon}`
	return null
}
