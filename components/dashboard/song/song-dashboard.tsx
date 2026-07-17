"use client"
import { useEffect, useState } from "react"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { usePlaybackTime, usePlayer } from "@/hooks/use-player"
import type { GuildSession } from "@/lib/session"
import { AddSongForm } from "./add-song-form"
import { HistoryItem } from "./history-item"
import { NowPlaying } from "./now-playing"
import { PlayerControls } from "./player-controls"
import { PlayerPlaceholder } from "./placeholder"
import { Queue } from "./queue"

/** The full music player: add form, transport, now playing, history, queue. */
export function SongDashboard({ session }: { session: GuildSession }) {
	const { data, isLoading } = usePlayer(session)
	const time = usePlaybackTime(data)
	const [volumeLabel, setVolumeLabel] = useState(0)
	const [waited, setWaited] = useState(false)

	useEffect(() => {
		const id = setTimeout(() => setWaited(true), 2000)
		return () => clearTimeout(id)
	}, [])

	useEffect(() => {
		setVolumeLabel(data ? data.volume * 100 : -1)
	}, [data])

	if (!data || isLoading) {
		return <PlayerPlaceholder showWaitedMessage={waited} />
	}

	return (
		<div className="mt-10 gap-4 flex flex-col">
			<div className="flex flex-col gap-4">
				<Label className="text-3xl font-semibold">Song Dashboard</Label>
				<AddSongForm session={session} />
				<PlayerControls
					data={data}
					session={session}
					volumeLabel={volumeLabel}
				/>
			</div>
			<NowPlaying data={data} session={session} time={time} />
			<Accordion type="single" collapsible>
				<AccordionItem value="history">
					<AccordionTrigger>
						<h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
							History
						</h2>
					</AccordionTrigger>
					<AccordionContent>
						{!data.history ? (
							<Label className="text-red-500 italic">
								An error occurred
							</Label>
						) : data.history.length > 0 ? (
							<div className="flex flex-col gap-2">
								{Array.from(new Set(data.history)).map(link => (
									<div key={link}>
										<HistoryItem
											link={link}
											session={session}
										/>
									</div>
								))}
							</div>
						) : (
							<Label className="text-zinc-500 italic">
								No history
							</Label>
						)}
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="queue">
					<AccordionTrigger>
						<h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
							Queue
						</h2>
					</AccordionTrigger>
					<AccordionContent>
						{!data.queue ? (
							<Label className="text-red-500 italic">
								An error occurred
							</Label>
						) : data.queue.length > 0 ? (
							<Queue initQueue={data.queue} session={session} />
						) : (
							<Label className="text-zinc-500 italic">
								No song in queue
							</Label>
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	)
}
