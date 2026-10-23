import { apiFetch } from "./client"
import type {
	LyricsDelayReply,
	LyricsReply,
	SearchHit,
	SearchResult,
	Suggestion,
	YoutubePlaylistData,
	YoutubeVideoData,
} from "./types"

/** Resolves a free-text query to the best-matching YouTube video. */
export async function searchYoutube(query: string): Promise<SearchResult> {
	const res = await apiFetch("/api/search", { method: "POST", body: { query } })
	return res.json()
}

/**
 * The top matches for a query, for the live search dropdown.
 *
 * Returns an empty list rather than throwing: this runs on every keystroke, so
 * a failed request should leave the dropdown empty, not break the form.
 */
export async function searchYoutubeMany(
	query: string,
	limit = 5,
	signal?: AbortSignal,
): Promise<SearchHit[]> {
	const res = await apiFetch("/api/search", {
		method: "POST",
		body: { query, limit },
		signal,
	}).catch(() => null)
	if (!res?.ok) return []
	const data: SearchResult = await res.json().catch(() => null)
	return data?.results ?? []
}

/** Video metadata for a YouTube URL; cached aggressively as it never changes. */
export async function getVideoDetails(url: string): Promise<YoutubeVideoData> {
	const res = await apiFetch("/api/getVideoDetail", {
		method: "POST",
		body: { url },
		cache: "force-cache",
	})
	return res.json()
}

/** Related-track suggestions for a guild's current/recent songs. */
export async function getSuggestions(guildId: string): Promise<Suggestion[]> {
	const res = await apiFetch(`/api/suggestions/${guildId}`)
	if (!res.ok) return []
	const { content }: { content: Suggestion[] } = await res.json()
	return content ?? []
}

/** What a playlist link holds, for previewing it before it is queued. */
export async function getPlaylistDetails(
	url: string,
): Promise<YoutubePlaylistData | null> {
	const res = await apiFetch("/api/getPlaylistDetail", {
		method: "POST",
		body: { url },
	}).catch(() => null)
	if (!res?.ok) return null
	return res.json()
}

/**
 * Lyrics for a guild's current track, or for `query` when the automatic match
 * was wrong. Throws on a failed request so SWR can tell "no lyrics" from "the
 * lyrics service is down".
 */
export async function getLyrics(
	guildId: string,
	query?: string,
): Promise<LyricsReply> {
	const search = query ? `?q=${encodeURIComponent(query)}` : ""
	const res = await apiFetch(`/api/lyrics/${guildId}${search}`)
	if (!res.ok) throw new Error(`Lyrics request failed (${res.status})`)
	return res.json()
}

/**
 * Sets the playing song's lyrics delay for everyone who plays it, or with null
 * returns it to the bot-wide default. `link` must be the playing track; null
 * when the request failed or the song changed meanwhile.
 */
export async function setLyricsDelay(
	guildId: string,
	link: string,
	delayMs: number | null,
): Promise<LyricsDelayReply | null> {
	const res = await apiFetch(`/api/lyrics/${guildId}/delay`, {
		method: "POST",
		body: { link, delayMs },
	}).catch(() => null)
	if (!res?.ok) return null
	return res.json()
}
