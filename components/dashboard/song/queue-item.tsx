"use client"
import { DragHandleDots1Icon, TrashIcon } from "@radix-ui/react-icons"
import { Reorder } from "framer-motion"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DeviceType, useDevice } from "@/hooks/use-device"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, type QueueItem } from "@/lib/api/types"
import type { GuildSession } from "@/lib/session"
import { VideoLink } from "./video-link"

export function QueueEntry({
	session,
	index,
	value,
}: {
	session: GuildSession
	index: number
	value: QueueItem
}) {
	const device = useDevice()
	const showDragHandle =
		device === DeviceType.Mobile || device === DeviceType.Tablet

	async function remove() {
		if (await editSong(session, SongEditType.RemoveSong, { index })) {
			toast("Removed song from queue")
		} else {
			toast("Failed to remove song from queue")
		}
		mutate(songKey(session.guildId))
	}

	return (
		<Reorder.Item value={value} key={value.url} className="w-full">
			<div className="break-words w-full flex items-center hover:cursor-grab active:cursor-grabbing gap-2 dark:hover:bg-neutral-800/50 hover:bg-neutral-200/50 p-2 rounded-xl">
				{showDragHandle && <DragHandleDots1Icon />}
				<div className="flex-1 overflow-hidden">
					<Label className="mr-2 font-bold text-base">
						{index + 1}.
					</Label>
					<VideoLink url={value.url} session={session} />
				</div>
				<Button variant="destructive" onClick={remove}>
					<TrashIcon />
				</Button>
			</div>
		</Reorder.Item>
	)
}
