export type SessionType = "admin" | "bearer" | "visitor"

export interface Session {
	type: SessionType
	token: string
}

/** A session scoped to a single guild (song dashboard, visitor links). */
export interface GuildSession extends Session {
	guildId: string
}

/**
 * The backend distinguishes credential kinds purely by the Authorization
 * header format: admin passwords use `Basic`, Discord OAuth tokens use
 * `Bearer`, and one-time visitor tokens are sent raw with no prefix.
 */
export function authHeader({ type, token }: Session): string {
	switch (type) {
		case "admin":
			return `Basic ${token}`
		case "bearer":
			return `Bearer ${token}`
		case "visitor":
			return token
	}
}

const ADMIN_KEY = "key"
const BEARER_KEY = "bearer"

export function readStoredSession(): Session | null {
	const bearer = window.localStorage.getItem(BEARER_KEY)
	if (bearer) {
		return { type: "bearer", token: bearer }
	}
	const key = window.localStorage.getItem(ADMIN_KEY)
	if (key) {
		return { type: "admin", token: key }
	}
	return null
}

export function storeSession(session: Session) {
	if (session.type === "admin") {
		window.localStorage.setItem(ADMIN_KEY, session.token)
		window.localStorage.removeItem(BEARER_KEY)
	} else if (session.type === "bearer") {
		window.localStorage.setItem(BEARER_KEY, session.token)
	}
}

export function clearStoredSession() {
	window.localStorage.removeItem(ADMIN_KEY)
	window.localStorage.removeItem(BEARER_KEY)
}

/** Drops only the bearer token, keeping any stored admin password usable. */
export function clearBearerToken() {
	window.localStorage.removeItem(BEARER_KEY)
}
