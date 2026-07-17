"use client"
import { PlusIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/shared/spinner"
import { useSuggestions } from "@/hooks/use-suggestions"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType } from "@/lib/api/types"
import { formatDuration } from "@/lib/format"

/** Related-track suggestions the user can enqueue with one click. */
export function Suggestions({ guildId }: { guildId: string }) {
	const { data, isLoading } = useSuggestions(guildId)

	async function add(url: string, title: string) {
		if (await editSong(guildId, SongEditType.AddSong, { url })) {
			toast(`Queued "${title}"`)
		} else {
			toast("Failed to add song")
		}
		mutate(songKey(guildId))
	}

	if (isLoading) {
		return (
			<div className="grid place-items-center py-8">
				<Spinner />
			</div>
		)
	}
	if (data.length === 0) {
		return (
			<p className="text-zinc-500 italic text-sm px-2 py-6 text-center">
				No suggestions yet — play something first.
			</p>
		)
	}

	return (
		<div className="flex flex-col gap-1">
			{data.map(s => (
				<div
					key={s.url}
					className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5"
				>
					<div className="flex-1 overflow-hidden">
						<a
							href={s.url}
							target="_blank"
							rel="noreferrer"
							className="text-sm truncate block hover:text-indigo-300"
						>
							{s.title}
						</a>
						<span className="text-xs text-zinc-500">
							{s.channel ? `${s.channel} · ` : ""}
							{formatDuration(s.durationInSec)}
						</span>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-indigo-300"
						onClick={() => add(s.url, s.title)}
					>
						<PlusIcon />
					</Button>
				</div>
			))}
		</div>
	)
}
