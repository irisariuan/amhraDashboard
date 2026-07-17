"use client"
import { DoubleArrowRightIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { useVideoDetails } from "@/hooks/use-video-details"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, type SongReply } from "@/lib/api/types"

/** Large album-art-forward now-playing hero. */
export function NowPlaying({
	data,
	guildId,
}: {
	data: SongReply
	guildId: string
}) {
	const { data: details } = useVideoDetails(data.song?.link ?? "")
	const art = data.song?.thumbnails?.at(-1) ?? details?.channel?.url

	async function skipSegment() {
		if (await editSong(guildId, SongEditType.SkipSegment)) {
			toast("Skipped non-music")
		}
		mutate(songKey(guildId))
	}

	if (!data.song) {
		return (
			<div className="flex flex-col items-center justify-center gap-4 text-center py-16">
				<div className="w-48 h-48 rounded-2xl bg-white/5 grid place-items-center text-zinc-600">
					<MusicGlyph />
				</div>
				<p className="text-zinc-500 italic">Nothing is playing right now</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col items-center text-center gap-5">
			<div className="relative">
				{art ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={art}
						alt=""
						className="w-56 h-56 md:w-64 md:h-64 rounded-2xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10"
					/>
				) : (
					<div className="w-56 h-56 rounded-2xl bg-white/5 grid place-items-center text-zinc-600">
						<MusicGlyph />
					</div>
				)}
			</div>
			<div className="max-w-md">
				<h2 className="text-2xl font-bold leading-tight truncate">
					{data.song.title ?? "Unknown title"}
				</h2>
				<a
					href={data.song.channel}
					target="_blank"
					rel="noreferrer"
					className="text-zinc-400 hover:text-zinc-200 text-sm"
				>
					{details?.channel?.name ?? " "}
				</a>
			</div>
			{data.skipToTimestamp && (
				<Button variant="secondary" size="sm" onClick={skipSegment}>
					Skip non-music
					<DoubleArrowRightIcon className="ml-1" />
				</Button>
			)}
		</div>
	)
}

function MusicGlyph() {
	return (
		<svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
			<path
				d="M9 18V5l12-2v13"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
			<circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	)
}
