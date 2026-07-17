"use client"
import { Reorder } from "framer-motion"
import { useEffect, useState } from "react"
import { usePlayer } from "@/hooks/use-player"
import { SongEditType, type QueueItem } from "@/lib/api/types"
import { editSong } from "@/lib/api/songs"
import type { GuildSession } from "@/lib/session"
import { QueueEntry } from "./queue-item"

/** Drag-to-reorder queue; the new order is pushed to the bot on release. */
export function Queue({
	initQueue,
	session,
}: {
	initQueue: QueueItem[]
	session: GuildSession
}) {
	const { data } = usePlayer(session)

	const [syncedQueue, setSyncedQueue] = useState<QueueItem[]>(initQueue)
	const [queue, setQueue] = useState<QueueItem[]>(initQueue)
	useEffect(() => {
		if (data) {
			setQueue(data.queue)
		}
	}, [data])

	function commitReorder() {
		if (syncedQueue !== queue) {
			editSong(session, SongEditType.SetQueue, { queue })
			setSyncedQueue(queue)
		}
	}

	return (
		<Reorder.Group
			axis="y"
			values={initQueue}
			onReorder={setQueue}
			onMouseUp={commitReorder}
			onTouchEnd={commitReorder}
			className="flex flex-col w-full justify-center items-center gap-2"
		>
			{queue.map((item, index) => (
				<QueueEntry
					session={session}
					index={index}
					value={item}
					key={item.url}
				/>
			))}
		</Reorder.Group>
	)
}
