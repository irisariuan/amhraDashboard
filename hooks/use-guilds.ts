"use client"
import useSWR from "swr"
import { getAllGuilds, getMessages, getPlayingGuilds, messagesKey } from "@/lib/api/guilds"
import type { Session } from "@/lib/session"

/** Guilds where a player is active (Song tab picker). */
export function usePlayingGuilds(session: Session) {
	const { data, isLoading } = useSWR("/api/playingGuildIds", () =>
		getPlayingGuilds(session),
	)
	return { data, isLoading }
}

/** All guilds the bot is in (admin-only, Message tab picker). */
export function useAllGuilds(session: Session) {
	const { data, isLoading } = useSWR("/api/guildIds/all", () =>
		getAllGuilds(session),
	)
	return { data, isLoading }
}

/** Channel messages for a guild (admin-only). */
export function useMessages(session: Session, guildId: string) {
	const { data, isLoading } = useSWR(messagesKey(guildId), () =>
		getMessages(session, guildId),
	)
	return { data, isLoading }
}
