"use client"
import useSWR from "swr"
import { getPlayingGuilds } from "@/lib/api/guilds"

/** Guilds where a player is active and controllable by the current account. */
export function usePlayingGuilds() {
	const { data, isLoading } = useSWR("/api/playingGuildIds", getPlayingGuilds, {
		refreshInterval: 15000,
	})
	return { data: data ?? [], isLoading }
}
