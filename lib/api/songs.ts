import { apiFetch } from "./client"
import { type QueueItem, SongEditType, type SongReply } from "./types"
import type { GuildSession } from "@/lib/session"

type EditDetailMap = {
	[SongEditType.AddSong]: { url: string }
	[SongEditType.SetTime]: { sec: number }
	[SongEditType.RemoveSong]: { index: number }
	[SongEditType.SetVolume]: { volume: number }
	[SongEditType.SetQueue]: { queue: QueueItem[] }
	[SongEditType.Loop]: { loop: boolean }
}

type DetailAction = keyof EditDetailMap
/** Actions that carry no detail payload. */
export type PlainSongAction = Exclude<SongEditType, DetailAction>

export async function editSong<A extends DetailAction>(
	session: GuildSession,
	action: A,
	detail: EditDetailMap[A],
): Promise<boolean>
export async function editSong(
	session: GuildSession,
	action: PlainSongAction,
): Promise<boolean>
export async function editSong(
	session: GuildSession,
	action: SongEditType,
	detail?: EditDetailMap[DetailAction],
): Promise<boolean> {
	const res = await apiFetch("/api/song/edit", session, {
		method: "POST",
		body: {
			action,
			guildId: session.guildId,
			...(detail ? { detail } : {}),
		},
	})
	return res.ok
}

export async function getSong(session: GuildSession): Promise<SongReply | null> {
	const res = await apiFetch(`/api/song/get/${session.guildId}`, session)
	return res.json()
}

export function songKey(guildId: string) {
	return `/api/song/get/${guildId}`
}
