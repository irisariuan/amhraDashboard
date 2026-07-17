import { apiFetch } from "./client"
import type { ActionData } from "./types"
import type { GuildSession, Session } from "@/lib/session"

/** Validates credentials against the bot server. */
export async function login(session: Session): Promise<boolean> {
	const res = await apiFetch("/api/new", session)
	return res.ok
}

// The backend has always received logout as a Basic credential regardless of
// session type; the call is fire-and-forget.
export async function logout(session: Session): Promise<boolean> {
	const res = await apiFetch("/api/logout", { ...session, type: "admin" })
	return res.ok
}

/** Admin-only bot actions: terminate, reload commands, reload settings. */
export function postAction(session: Session, data: ActionData) {
	return apiFetch("/api/action", { ...session, type: "admin" }, {
		method: "POST",
		body: data,
	})
}

/** Checks a visitor link is still valid; polled while the visitor page is open. */
export async function verifyVisitor(session: GuildSession): Promise<boolean> {
	const res = await apiFetch("/api/live", session, {
		method: "POST",
		body: { guildId: session.guildId },
	})
	return res.ok
}
