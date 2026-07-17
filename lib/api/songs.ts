import { apiFetch } from "./client"
import { type QueueItem, SongEditType, type SongReply } from "./types"

type EditDetailMap = {
	[SongEditType.AddSong]: { url: string }
	[SongEditType.SetTime]: { sec: number }
	[SongEditType.RemoveSong]: { index: number }
	[SongEditType.SetVolume]: { volume: number }
	[SongEditType.SetQueue]: { queue: QueueItem[] }
	[SongEditType.Loop]: { loop: boolean }
	[SongEditType.AutoSuggest]: { autoSuggest: boolean }
}

type DetailAction = keyof EditDetailMap
/** Actions that carry no detail payload. */
export type PlainSongAction = Exclude<SongEditType, DetailAction>

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

export async function getSong(guildId: string): Promise<SongReply | null> {
	const res = await apiFetch(`/api/song/get/${guildId}`)
	if (!res.ok) return null
	return res.json()
}

export function songKey(guildId: string) {
	return `/api/song/get/${guildId}`
}
