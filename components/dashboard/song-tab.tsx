"use client"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePlayingGuilds } from "@/hooks/use-guilds"
import { songKey } from "@/lib/api/songs"
import type { Session } from "@/lib/session"
import { SongDashboard } from "./song/song-dashboard"

export function SongTab({ session }: { session: Session }) {
	const { data, isLoading } = usePlayingGuilds(session)
	const [guildId, setGuildId] = useState<string | null>(null)

	useEffect(() => {
		if (data && data.length > 0) return
		setGuildId(null)
	}, [data])

	if (isLoading) {
		return <Skeleton className="w-[100px] h-[20px] rounded-full" />
	}

	return (
		<div>
			<div className="flex gap-2 items-center">
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
					<Button
						variant="outline"
						size="icon"
						onClick={() => {
							mutate(songKey(guildId))
							mutate("/api/playingGuildIds")
						}}
					>
						<ReloadIcon />
					</Button>
				)}
			</div>
			{guildId && <SongDashboard session={{ ...session, guildId }} />}
		</div>
	)
}
