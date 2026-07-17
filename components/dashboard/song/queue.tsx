"use client"
import { Reorder } from "framer-motion"
import { useEffect, useState } from "react"
import { usePlayer } from "@/hooks/use-player"
import { SongEditType, type QueueItem } from "@/lib/api/types"
import { editSong } from "@/lib/api/songs"
import { QueueEntry } from "./queue-item"

/** Drag-to-reorder queue; the new order is pushed to the bot on release. */
export function Queue({
	initQueue,
	guildId,
}: {
	initQueue: QueueItem[]
	guildId: string
}) {
	const { data } = usePlayer(guildId)

	const [syncedQueue, setSyncedQueue] = useState<QueueItem[]>(initQueue)
	const [queue, setQueue] = useState<QueueItem[]>(initQueue)
	useEffect(() => {
		if (data) setQueue(data.queue)
	}, [data])

	function commitReorder() {
		if (syncedQueue !== queue && queue.length > 0) {
			editSong(guildId, SongEditType.SetQueue, { queue })
			setSyncedQueue(queue)
		}
	}

	return (
		<Reorder.Group
			axis="y"
			values={queue}
			onReorder={setQueue}
			onMouseUp={commitReorder}
			onTouchEnd={commitReorder}
			className="flex flex-col w-full gap-1"
		>
			{queue.map((item, index) => (
				<QueueEntry
					guildId={guildId}
					index={index}
					value={item}
					key={item.url}
				/>
			))}
		</Reorder.Group>
	)
}
