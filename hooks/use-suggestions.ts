"use client"
import useSWR from "swr"
import { getSuggestions } from "@/lib/api/videos"

/** Related-track suggestions for a guild's current/recent songs. */
export function useSuggestions(guildId: string | null) {
	const { data, isLoading } = useSWR(
		guildId ? `/api/suggestions/${guildId}` : null,
		() => getSuggestions(guildId as string),
		{ refreshInterval: 30000 },
	)
	return { data: data ?? [], isLoading }
}
