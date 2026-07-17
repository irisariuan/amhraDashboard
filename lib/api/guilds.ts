import { apiFetch } from "./client"
import type { Guild } from "./types"

/** Guilds where a player is active and the current account can control it. */
export async function getPlayingGuilds(): Promise<Guild[]> {
	const res = await apiFetch("/api/playingGuildIds")
	if (!res.ok) return []
	const { content }: { content: Guild[] } = await res.json()
	return content ?? []
}

/** Every guild the bot is in (admin only). */
export async function getAllGuilds(): Promise<Guild[]> {
	const res = await apiFetch("/api/guildIds/all")
	if (!res.ok) return []
	const { content }: { content: Guild[] } = await res.json()
	return content ?? []
}
