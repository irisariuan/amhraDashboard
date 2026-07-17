import { apiFetch } from "./client"
import type { Log, LogExtraType } from "./types"

const ExtraTypeTag = /\[[A-Z].*\]/

/**
 * Fetches server logs (admin only). A leading `[VOICE]`/`[DELETE]`/`[EDIT]` tag
 * is stripped into `extraType`; the list is reversed so newest entries lead.
 */
export async function getLogs(): Promise<Log[]> {
	const res = await apiFetch("/api/log")
	if (!res.ok) throw new Error(`Failed to fetch logs (${res.status})`)
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
