import { apiFetch } from "./client"
import type { SearchResult, Suggestion, YoutubeVideoData } from "./types"

/** Resolves a free-text query to the best-matching YouTube video. */
export async function searchYoutube(query: string): Promise<SearchResult> {
	const res = await apiFetch("/api/search", { method: "POST", body: { query } })
	return res.json()
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
