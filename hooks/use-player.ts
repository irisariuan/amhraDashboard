"use client"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { getSong, songKey } from "@/lib/api/songs"
import type { SongReply } from "@/lib/api/types"

/** Live player state for a guild, polled from the bot. */
export function usePlayer(guildId: string, refreshInterval = 2000) {
	const { data, isLoading } = useSWR<SongReply | null>(
		songKey(guildId),
		() => getSong(guildId),
		{ refreshInterval },
	)
	return { data: data ?? null, isLoading }
}

/**
 * Elapsed playback seconds, derived from the song's start timestamp and
 * accumulated pause time; ticks every 100 ms while a song is loaded.
 */
export function usePlaybackTime(data: SongReply | null): number {
	const [now, setNow] = useState(() => Date.now())
	// Kept ticking through a pause, so the clock is current the moment it resumes
	const ticking = Boolean(data?.song)

	useEffect(() => {
		if (!ticking) return
		const intervalId = setInterval(() => setNow(Date.now()), 100)
		return () => clearInterval(intervalId)
	}, [ticking])

	if (!data?.song) return 0
	const { startTime, startFrom } = data.song
	const reference = data.paused ? data.pausedTimestamp : now
	// The clock can be up to a tick behind a song that only just started
	return Math.max(0, (reference - startTime - data.pausedInMs + startFrom) / 1000)
}
