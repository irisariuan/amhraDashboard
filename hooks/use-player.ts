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
 * accumulated pause time; ticks every 100 ms while playing.
 */
export function usePlaybackTime(data: SongReply | null): number {
	const [time, setTime] = useState(0)

	useEffect(() => {
		if (!data?.song) {
			setTime(0)
			return
		}
		const { startTime, startFrom } = data.song
		const elapsed = () => {
			const reference = data.paused ? data.pausedTimestamp : Date.now()
			return (reference - startTime - data.pausedInMs + startFrom) / 1000
		}
		setTime(elapsed())
		const intervalId = setInterval(() => setTime(elapsed()), 100)
		return () => clearInterval(intervalId)
	}, [data])

	return time
}
