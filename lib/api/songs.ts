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
	[SongEditType.SetMainVolume]: { volume: number }
	[SongEditType.AddMixTrack]: TrackSettings
	[SongEditType.RemoveMixTrack]: { track: string }
	[SongEditType.SetMixTrack]: TrackSettings & { track: string }
	[SongEditType.SkipMixTrack]: { track: string }
	[SongEditType.RemoveMixSong]: { track: string; index: number; url?: string }
}

/** Volume is linear, like the player's; what is left out stays as it is. */
export interface TrackSettings {
	volume?: number
	gapMs?: number
	loop?: boolean
	/** Hold or release just this queue; only for a queue already there */
	paused?: boolean
}

type DetailAction = keyof EditDetailMap
/** Actions that carry no detail payload. The slow mix actions have their own helpers below. */
export type PlainSongAction = Exclude<
	SongEditType,
	DetailAction | SongEditType.AddMixSong | SongEditType.MoveMixSong
>

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

export type MixError =
	| "not_native"
	| "not_connected"
	| "full"
	| "not_found"
	| "rejected"
	| "failed"

const MIX_ERRORS: Record<number, MixError> = {
	// The request itself was refused, such as a bot older than this dashboard
	400: "rejected",
	501: "not_native",
	409: "not_connected",
	422: "full",
	404: "not_found",
}

/**
 * Queue a video on a mix track, or on a new track when `track` is left out.
 * Slow: the bot looks the video up before it answers.
 */
export async function addMixSong(
	guildId: string,
	url: string,
	track?: string,
): Promise<{ ok: true } | { error: MixError }> {
	const res = await apiFetch("/api/song/edit", {
		method: "POST",
		body: {
			action: SongEditType.AddMixSong,
			guildId,
			detail: { url, ...(track ? { track } : {}) },
		},
	})
	if (res.ok) return { ok: true }
	return { error: MIX_ERRORS[res.status] ?? "failed" }
}

/**
 * Where a song sits: a queue by its number, "1" for the guild's first. As a
 * destination, `"new"` is a queue made for it, and a missing `index` is the
 * end.
 */
export interface MixPlace {
	track: string
	index?: number
	/**
	 * As a destination on a mix track: the silence before it, after whatever
	 * comes before it — where on the timeline it was dropped.
	 */
	gapMs?: number
}

/**
 * Move a queued song along its lane or onto another, the guild's queue
 * included. `url` is what was at `from` when the drag started, so a reorder
 * landing at the same moment cannot move the wrong song. Slow when it moves
 * a song off the queue, which the bot looks up first.
 */
export async function moveMixSong(
	guildId: string,
	from: { track: string; index: number },
	to: MixPlace,
	url: string,
): Promise<{ ok: true } | { error: MixError }> {
	const res = await apiFetch("/api/song/edit", {
		method: "POST",
		body: { action: SongEditType.MoveMixSong, guildId, detail: { from, to, url } },
	})
	if (res.ok) return { ok: true }
	return { error: MIX_ERRORS[res.status] ?? "failed" }
}

export async function getSong(guildId: string): Promise<SongReply | null> {
	const res = await apiFetch(`/api/song/get/${guildId}`)
	if (!res.ok) return null
	const reply: SongReply = await res.json()
	// Times in the reply are as of when the bot made it; this is what they
	// are counted on from.
	return { ...reply, receivedAt: Date.now() }
}

export function songKey(guildId: string) {
	return `/api/song/get/${guildId}`
}
