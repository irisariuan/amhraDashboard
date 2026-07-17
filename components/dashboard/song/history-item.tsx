"use client"
import { PlusIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType } from "@/lib/api/types"
import { VideoLink } from "./video-link"

/** A previously played (or suggested) track with a one-click enqueue button. */
export function TrackRow({ url, guildId }: { url: string; guildId: string }) {
	async function addToQueue() {
		if (await editSong(guildId, SongEditType.AddSong, { url })) {
			toast("Added song to queue")
		} else {
			toast("Failed to add song to queue")
		}
		mutate(songKey(guildId))
	}

	return (
		<div className="group flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
			<div className="flex-1 min-w-0 overflow-hidden">
				<VideoLink url={url} />
			</div>
			<Button
				variant="ghost"
				size="icon"
				className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-indigo-300"
				onClick={addToQueue}
			>
				<PlusIcon />
			</Button>
		</div>
	)
}
