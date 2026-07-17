"use client"
import useSWR from "swr"
import { getVideoDetails } from "@/lib/api/videos"
import type { Session } from "@/lib/session"

/** Video metadata for a YouTube URL, SWR-keyed by the URL itself. */
export function useVideoDetails(url: string, session: Session) {
	const { data, isLoading, error } = useSWR(url, () =>
		getVideoDetails(url, session),
	)
	return { data, isLoading, error }
}
