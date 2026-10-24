import { apiFetch } from "./client"
import type { ScheduledPlay } from "./types"

export type ScheduleError = "not_connected" | "need_time" | "not_found" | "invalid"

/**
 * Schedule a video to cut in at `at` (epoch ms). Leaving `at` out times an
 * upcoming premiere to its start; anything else is refused with `need_time`.
 */
export async function addSchedule(
	guildId: string,
	url: string,
	at?: number,
	/** The queue to cut in on; queue 1 when left out */
	queue?: number,
): Promise<{ entry: ScheduledPlay } | { error: ScheduleError }> {
	const res = await apiFetch("/api/schedule/add", {
		method: "POST",
		body: {
			guildId,
			url,
			...(at !== undefined ? { at } : {}),
			...(queue !== undefined && queue !== 1 ? { queue } : {}),
		},
	})
	if (res.ok) return { entry: await res.json() }
	switch (res.status) {
		case 409:
			return { error: "not_connected" }
		case 422:
			return { error: "need_time" }
		case 404:
			return { error: "not_found" }
		default:
			return { error: "invalid" }
	}
}

/**
 * Answer a pending schedule, before or during its warning: drop it, or have it
 * play next instead of cutting in. False once it has already started.
 */
export async function respondToSchedule(
	guildId: string,
	id: string,
	action: "cancel" | "queue",
): Promise<boolean> {
	const res = await apiFetch("/api/schedule/respond", {
		method: "POST",
		body: { guildId, id, action },
	})
	return res.ok
}
