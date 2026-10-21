import { apiFetch } from "./client"
import { type QueueItem, SongEditType, type SongReply } from "./types"

type EditDetailMap = {
	[SongEditType.AddSong]: { url: string; force?: boolean; seek?: number }
	[SongEditType.AddPlaylist]: { url: string; next?: boolean; force?: boolean }
	[SongEditType.SetCrossfade]: { crossfadeMs?: number; skipFadeMs?: number }
	[SongEditType.SetTime]: { sec: number }
	[SongEditType.RemoveSong]: { index: number }
	[SongEditType.SetVolume]: { volume: number }
	[SongEditType.SetQueue]: { queue: QueueItem[] }
	[SongEditType.Loop]: { loop: boolean }
	[SongEditType.AutoSuggest]: { autoSuggest: boolean }
	[SongEditType.RemoveLayer]: { id: string }
	[SongEditType.SetLayerVolume]: { id: string; volume: number }
	[SongEditType.SetMainVolume]: { volume: number }
}

type DetailAction = keyof EditDetailMap
/** Actions that carry no detail payload. AddLayer has its own helper below. */
export type PlainSongAction = Exclude<SongEditType, DetailAction | SongEditType.AddLayer>

export async function editSong<A extends DetailAction>(
	guildId: string,
	action: A,
	detail: EditDetailMap[A],
): Promise<boolean>
export async function editSong(
	guildId: string,
	action: PlainSongAction,
): Promise<boolean>
export async function editSong(
	guildId: string,
	action: SongEditType,
	detail?: EditDetailMap[DetailAction],
): Promise<boolean> {
	const res = await apiFetch("/api/song/edit", {
		method: "POST",
		body: { action, guildId, ...(detail ? { detail } : {}) },
	})
	return res.ok
}

/**
 * Add a video, which the bot may schedule instead of queueing: an upcoming
 * premiere cannot be played yet, so it is set to cut in when it starts (202).
 */
export async function addSong(
	guildId: string,
	url: string,
): Promise<"queued" | "scheduled" | "failed"> {
	const res = await apiFetch("/api/song/edit", {
		method: "POST",
		body: { action: SongEditType.AddSong, guildId, detail: { url } },
	})
	if (res.status === 202) return "scheduled"
	return res.ok ? "queued" : "failed"
}

export type AddLayerError = "not_native" | "not_connected" | "full" | "not_found" | "failed"

const ADD_LAYER_ERRORS: Record<number, AddLayerError> = {
	501: "not_native",
	409: "not_connected",
	422: "full",
	404: "not_found",
}

/**
 * Mix a video in over the queue at `volume` (linear, 1 is 100%). Slow: the bot
 * starts the download before it answers.
 */
export async function addLayer(
	guildId: string,
	url: string,
	volume = 1,
): Promise<{ ok: true } | { error: AddLayerError }> {
	const res = await apiFetch("/api/song/edit", {
		method: "POST",
		body: { action: SongEditType.AddLayer, guildId, detail: { url, volume } },
	})
	if (res.ok) return { ok: true }
	return { error: ADD_LAYER_ERRORS[res.status] ?? "failed" }
}

export async function getSong(guildId: string): Promise<SongReply | null> {
	const res = await apiFetch(`/api/song/get/${guildId}`)
	if (!res.ok) return null
	return res.json()
}

export function songKey(guildId: string) {
	return `/api/song/get/${guildId}`
}
