import { apiFetch } from "./client"
import type { SearchResult, YoutubeVideoData } from "./types"
import type { Session } from "@/lib/session"

/** Resolves a free-text query to the best-matching YouTube video. */
export async function searchYoutube(
	query: string,
	session: Session,
): Promise<SearchResult> {
	const res = await apiFetch("/api/search", session, {
		method: "POST",
		body: { query },
	})
	return res.json()
}

/** Video metadata for a YouTube URL; cached aggressively as it never changes. */
export async function getVideoDetails(
	url: string,
	session: Session,
): Promise<YoutubeVideoData> {
	const res = await apiFetch("/api/getVideoDetail", session, {
		method: "POST",
		body: { url },
		cache: "force-cache",
	})
	return res.json()
}
