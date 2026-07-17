"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SongReply } from "@/lib/api/types"
import { AddSongForm } from "./add-song-form"
import { Queue } from "./queue"
import { Suggestions } from "./suggestions"
import { TrackRow } from "./history-item"

/** Right-hand column: add form plus tabbed Queue / History / Suggestions. */
export function Panels({
	data,
	guildId,
}: {
	data: SongReply
	guildId: string
}) {
	const history = Array.from(new Set(data.history ?? [])).reverse()

	return (
		<div className="flex flex-col gap-3 h-full">
			<AddSongForm guildId={guildId} />
			<Tabs defaultValue="queue" className="flex flex-col flex-1 min-h-0">
				<TabsList className="self-start">
					<TabsTrigger value="queue">
						Queue{data.queue?.length ? ` (${data.queue.length})` : ""}
					</TabsTrigger>
					<TabsTrigger value="suggestions">Suggestions</TabsTrigger>
					<TabsTrigger value="history">History</TabsTrigger>
				</TabsList>
				<ScrollArea className="flex-1 min-h-0 mt-2 pr-2">
					<TabsContent value="queue" className="mt-0">
						{data.queue?.length > 0 ? (
							<Queue initQueue={data.queue} guildId={guildId} />
						) : (
							<p className="text-zinc-500 italic text-sm px-2 py-6 text-center">
								Queue is empty
							</p>
						)}
					</TabsContent>
					<TabsContent value="suggestions" className="mt-0">
						<Suggestions guildId={guildId} />
					</TabsContent>
					<TabsContent value="history" className="mt-0">
						{history.length > 0 ? (
							<div className="flex flex-col gap-1">
								{history.map(url => (
									<TrackRow key={url} url={url} guildId={guildId} />
								))}
							</div>
						) : (
							<p className="text-zinc-500 italic text-sm px-2 py-6 text-center">
								No history yet
							</p>
						)}
					</TabsContent>
				</ScrollArea>
			</Tabs>
		</div>
	)
}
