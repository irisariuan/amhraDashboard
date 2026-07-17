import { apiFetch } from "./client"
import type { Log, LogExtraType } from "./types"
import type { Session } from "@/lib/session"

const ExtraTypeTag = /\[[A-Z].*\]/

/**
 * Fetches server logs. Messages may carry a leading `[VOICE]`/`[DELETE]`/
 * `[EDIT]` tag which is stripped into `extraType`; the list is reversed so
 * the newest entries come first.
 */
export async function getLogs(session: Session): Promise<Log[]> {
	const res = await apiFetch("/api/log", session)
	if (!res.ok) {
		throw new Error(`Failed to fetch logs (${res.status})`)
	}
	const { content }: { content: Log[] } = await res.json()
	return content
		.map(log => {
			const tag = log.message.match(ExtraTypeTag)?.[0]
			if (tag) {
				return {
					...log,
					message: log.message.replace(tag, "").trim(),
					extraType: tag.slice(1, -1).toLowerCase() as LogExtraType,
				}
			}
			return log
		})
		.reverse()
}
