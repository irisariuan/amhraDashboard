import { apiFetch } from "./client"
import type { Channel, Guild } from "./types"
import type { Session } from "@/lib/session"

/** Guilds where the bot is currently playing (Song tab picker). */
export async function getPlayingGuilds(session: Session): Promise<Guild[]> {
	const res = await apiFetch("/api/playingGuildIds", session)
	const { content }: { content: Guild[] } = await res.json()
	return content ?? []
}

/** Every guild the bot is in (admin-only, Message tab picker). */
export async function getAllGuilds(session: Session): Promise<Guild[]> {
	const res = await apiFetch("/api/guildIds/all", session)
	const { content }: { content: Guild[] } = await res.json()
	return content ?? []
}

/** Recent messages per channel for a guild (admin-only). */
export async function getMessages(
	session: Session,
	guildId: string,
): Promise<Channel[]> {
	const res = await apiFetch(`/api/messages/${guildId}`, session)
	const { content }: { content: Channel[] } = (await res.json()) ?? {
		content: [],
	}
	return content
}

export function messagesKey(guildId: string) {
	return `/api/messages/${guildId}`
}
