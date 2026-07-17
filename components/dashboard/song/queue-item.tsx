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
			className="w-full group flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
		>
			<button
				type="button"
				onPointerDown={e => controls.start(e)}
				className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing touch-none"
				aria-label="Drag to reorder"
			>
				<DragHandleDots2Icon />
			</button>
			<span className="text-xs tabular-nums text-zinc-500 w-5 text-right">
				{index + 1}
			</span>
			<div className="flex-1 overflow-hidden">
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
				className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400"
				onClick={remove}
			>
				<TrashIcon />
			</Button>
		</Reorder.Item>
	)
}
