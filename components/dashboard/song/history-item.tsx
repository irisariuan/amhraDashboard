"use client"
import { PlusIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType } from "@/lib/api/types"
import type { GuildSession } from "@/lib/session"
import { VideoLink } from "./video-link"

/** Previously played song with a one-click re-queue button. */
export function HistoryItem({
	link,
	session,
}: {
	link: string
	session: GuildSession
}) {
	async function addToQueue() {
		if (await editSong(session, SongEditType.AddSong, { url: link })) {
			toast("Added song to queue")
		} else {
			toast("Failed to add song to queue")
		}
		mutate(songKey(session.guildId))
	}

	return (
		<div className="break-words w-full flex items-center hover:cursor-pointer gap-2 dark:hover:bg-neutral-900 hover:bg-neutral-200 p-2 rounded-xl">
			<div className="flex-1 overflow-hidden">
				<VideoLink url={link} session={session} />
			</div>
			<Button variant="outline" onClick={addToQueue}>
				<PlusIcon />
			</Button>
		</div>
	)
}
