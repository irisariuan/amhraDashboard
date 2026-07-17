"use client"
import { toast } from "sonner"
import { mutate } from "swr"
import { Area } from "@/components/shared/area"
import { Label } from "@/components/ui/label"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, type SongReply } from "@/lib/api/types"
import { formatClock } from "@/lib/format"
import type { GuildSession } from "@/lib/session"
import { ScrubBar } from "./scrub-bar"
import { VideoDetails } from "./video-details"

/** Current song details with a seek bar and playback clock. */
export function NowPlaying({
	data,
	session,
	time,
}: {
	data: SongReply
	session: GuildSession
	time: number
}) {
	async function seek(seconds: number) {
		if (
			!(await editSong(session, SongEditType.SetTime, {
				sec: Math.round(seconds),
			}))
		) {
			return toast("Failed to seek")
		}
		mutate(songKey(session.guildId))
	}

	return (
		<Area title="Now Playing">
			{data.song ? (
				<div className="flex flex-col gap-2 w-full">
					<VideoDetails url={data.song.link} session={session} />
					<div className="flex flex-col">
						<div className="w-full">
							<ScrubBar
								now={Math.max(time, 0)}
								totalValue={data.song.duration}
								enabled={data.canSeek}
								onRelease={seek}
								formatter={formatClock}
							/>
						</div>
						<Label className="text-neutral-700 dark:text-white">
							{formatClock(time)}/{formatClock(data.song.duration)}
						</Label>
					</div>
				</div>
			) : (
				<Label className="text-zinc-500 italic">Not playing song</Label>
			)}
		</Area>
	)
}
