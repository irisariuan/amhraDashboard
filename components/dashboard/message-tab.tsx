"use client"
import { useEffect, useState } from "react"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAllGuilds } from "@/hooks/use-guilds"
import type { Session } from "@/lib/session"
import { MessageList } from "./message-list"

export function MessageTab({ session }: { session: Session }) {
	const { data, isLoading } = useAllGuilds(session)
	const [guildId, setGuildId] = useState<string | null>(null)

	useEffect(() => {
		if (
			!data ||
			!guildId ||
			data.length <= 0 ||
			!data.some(guild => guild.id === guildId)
		) {
			setGuildId(null)
		}
	}, [data, guildId])

	if (isLoading) {
		return <Skeleton className="w-full h-4" />
	}

	return (
		<div>
			<Select
				onValueChange={setGuildId}
				disabled={!data || data.length <= 0}
			>
				<SelectTrigger>
					<SelectValue placeholder="Guilds" />
				</SelectTrigger>
				<SelectContent>
					{data?.map(guild => (
						<SelectItem value={guild.id} key={guild.id}>
							{guild.name} (ID: {guild.id})
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{guildId && (
				<div className="mt-6">
					<MessageList session={session} guildId={guildId} />
				</div>
			)}
		</div>
	)
}
