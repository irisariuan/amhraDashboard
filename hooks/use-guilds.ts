"use client"
import useSWR from "swr"
import { getAllGuilds, getPlayingGuilds } from "@/lib/api/guilds"

/** Guilds where a player is active and controllable by the current account. */
export function usePlayingGuilds() {
	const { data, isLoading } = useSWR("/api/playingGuildIds", getPlayingGuilds, {
		refreshInterval: 15000,
	})
	return { data: data ?? [], isLoading }
}

/** All guilds the bot is in (admin only). */
export function useAllGuilds(enabled: boolean) {
	const { data, isLoading } = useSWR(
		enabled ? "/api/guildIds/all" : null,
		getAllGuilds,
	)
	return { data: data ?? [], isLoading }
}
