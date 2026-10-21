"use client"
import { DragHandleDots2Icon, MixIcon, TrashIcon } from "@radix-ui/react-icons"
import { Reorder, useDragControls, type PanInfo } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, type QueueItem } from "@/lib/api/types"
import { formatClock } from "@/lib/format"
import { cn } from "@/lib/utils"
import { VideoLink } from "./video-link"

/** How far sideways a song has to be pulled before letting go mixes it in. */
const SPLIT_DISTANCE = 96

export function QueueEntry({
	guildId,
	index,
	value,
	onSplit,
}: {
	guildId: string
	index: number
	value: QueueItem
	/** Mix this song in now; absent where the bot cannot mix */
	onSplit?: () => void
}) {
	const controls = useDragControls()
	const [splitting, setSplitting] = useState(false)

	function drag(_event: PointerEvent, info: PanInfo) {
		if (onSplit) setSplitting(Math.abs(info.offset.x) >= SPLIT_DISTANCE)
	}

	function dragEnd(_event: PointerEvent, info: PanInfo) {
		setSplitting(false)
		if (onSplit && Math.abs(info.offset.x) >= SPLIT_DISTANCE) onSplit()
	}

	async function remove() {
		if (await editSong(guildId, SongEditType.RemoveSong, { index })) {
			toast("Removed song from queue")
		} else {
			toast("Failed to remove song from queue")
		}
		mutate(songKey(guildId))
	}

	return (
		<Reorder.Item
			value={value}
			dragListener={false}
			dragControls={controls}
			// Free to move both ways where a sideways pull means something, but
			// locked to whichever way the drag starts, so a reorder never mixes
			// a song in and a mix-in never reorders the queue
			drag={onSplit ? true : "y"}
			dragDirectionLock
			onDrag={drag}
			onDragEnd={dragEnd}
			className={cn(
				"group relative flex w-full min-w-0 flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 active:bg-white/5",
				splitting && "bg-indigo-500/15 ring-1 ring-indigo-400/50 hover:bg-indigo-500/15",
			)}
		>
			<button
				type="button"
				onPointerDown={e => controls.start(e)}
				className="cursor-grab touch-none text-zinc-500 hover:text-zinc-300 active:cursor-grabbing active:text-zinc-300"
				aria-label={onSplit ? "Drag to reorder, or sideways to mix in" : "Drag to reorder"}
				title={onSplit ? "Drag to reorder, or sideways to mix in" : "Drag to reorder"}
			>
				<DragHandleDots2Icon />
			</button>
			<span className="text-xs tabular-nums text-zinc-500 w-5 text-right">
				{index + 1}
			</span>
			<div className="flex-1 min-w-0 overflow-hidden">
				<VideoLink url={value.url} />
			</div>
			{value.seek ? (
				<span className="text-[10px] uppercase tracking-wide text-amber-400">
					resumes {formatClock(value.seek)}
				</span>
			) : null}
			{value.repeating && (
				<span className="text-[10px] uppercase tracking-wide text-indigo-400">
					loop
				</span>
			)}
			{splitting && (
				<span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-indigo-300">
					<MixIcon />
					release to mix in
				</span>
			)}
			<Button
				variant="ghost"
				size="icon"
				className="text-zinc-400 opacity-100 hover:text-red-400 active:bg-accent active:text-red-400 group-active:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
				onClick={remove}
			>
				<TrashIcon />
			</Button>
		</Reorder.Item>
	)
}
