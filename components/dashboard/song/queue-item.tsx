"use client"
import { DragHandleDots2Icon, TrashIcon } from "@radix-ui/react-icons"
import { Reorder, useDragControls } from "framer-motion"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, type QueueItem } from "@/lib/api/types"
import { VideoLink } from "./video-link"

export function QueueEntry({
	guildId,
	index,
	value,
}: {
	guildId: string
	index: number
	value: QueueItem
}) {
	const controls = useDragControls()

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
			className="group flex w-full min-w-0 flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 active:bg-white/5"
		>
			<button
				type="button"
				onPointerDown={e => controls.start(e)}
				className="cursor-grab touch-none text-zinc-500 hover:text-zinc-300 active:cursor-grabbing active:text-zinc-300"
				aria-label="Drag to reorder"
			>
				<DragHandleDots2Icon />
			</button>
			<span className="text-xs tabular-nums text-zinc-500 w-5 text-right">
				{index + 1}
			</span>
			<div className="flex-1 min-w-0 overflow-hidden">
				<VideoLink url={value.url} />
			</div>
			{value.repeating && (
				<span className="text-[10px] uppercase tracking-wide text-indigo-400">
					loop
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
