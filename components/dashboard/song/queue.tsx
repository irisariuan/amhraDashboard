"use client"
import { Reorder } from "framer-motion"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { usePlayer } from "@/hooks/use-player"
import { SongEditType, type QueueItem } from "@/lib/api/types"
import { editSong, mixFromQueue, songKey, type AddLayerError } from "@/lib/api/songs"
import { QueueEntry } from "./queue-item"

const MIX_ERROR_TEXT: Record<AddLayerError, string> = {
	not_native: "Mixing needs the bot's Rust voice engine (USE_RUST_VOICE), which is off",
	not_connected: "The bot needs to be in a voice channel to mix",
	full: "The mix is full — remove a song from the Mix tab first",
	not_found: "That song is no longer in the queue",
	failed: "Couldn't mix that song in",
}

/**
 * Drag up or down to reorder, pushed to the bot on release. Where the bot can
 * mix, dragging sideways instead takes a song out of the queue and starts it
 * on top of whatever is playing.
 */
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
	// Each poll replaces the local order
	const [polled, setPolled] = useState(data)
	if (data !== polled) {
		setPolled(data)
		if (data) setQueue(data.queue)
	}

	async function split(item: QueueItem, index: number) {
		// Out of the list at once, and out of the synced order too, so the
		// reorder commit on the same release does not push the queue without
		// it before the bot has actually taken it.
		const rest = queue.filter(queued => queued !== item)
		setQueue(rest)
		setSyncedQueue(rest)
		toast("Mixing in…")
		const result = await mixFromQueue(guildId, index, item.url)
		// Either way the next poll is the truth: without it, or back in place
		toast("error" in result ? MIX_ERROR_TEXT[result.error] : "Mixed in — see the Mix tab")
		mutate(songKey(guildId))
	}

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
			className="flex flex-col w-full min-w-0 gap-1"
		>
			{queue.map((item, index) => (
				<QueueEntry
					guildId={guildId}
					index={index}
					value={item}
					key={item.url}
					onSplit={data?.canMix ? () => split(item, index) : undefined}
				/>
			))}
		</Reorder.Group>
	)
}
