"use client"
import useSWR from "swr"
import { getVideoDetails } from "@/lib/api/videos"

/** Video metadata for a YouTube URL, SWR-keyed by the URL itself. */
export function useVideoDetails(url: string) {
	const { data, isLoading, error } = useSWR(url ? ["video", url] : null, () =>
		getVideoDetails(url),
	)
	return { data, isLoading, error }
}
