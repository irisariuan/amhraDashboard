"use client"
import useSWR from "swr"
import { getLyrics } from "@/lib/api/videos"

/**
 * Lyrics for the track playing in a guild.
 *
 * Keyed by the track link as well as the guild, so a song change fetches anew
 * instead of showing the previous song's words; nothing polls, since lyrics
 * for a given track never change.
 */
export function useLyrics(
	guildId: string,
	link: string | null,
	query: string | null,
) {
	const { data, error, isLoading } = useSWR(
		link || query ? ["lyrics", guildId, link, query] : null,
		() => getLyrics(guildId, query ?? undefined),
		{ revalidateOnFocus: false, shouldRetryOnError: false },
	)
	return { data: data ?? null, error, isLoading }
}
