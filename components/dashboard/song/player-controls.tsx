"use client"
import {
	DoubleArrowRightIcon,
	ExitIcon,
	LoopIcon,
	PauseIcon,
	ReloadIcon,
	ResumeIcon,
	SpeakerLoudIcon,
	SpeakerOffIcon,
	StopIcon,
	TrackNextIcon,
} from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { editSong, songKey, type PlainSongAction } from "@/lib/api/songs"
import {
	FormatSongEditType,
	SongEditType,
	type SongReply,
} from "@/lib/api/types"
import type { GuildSession } from "@/lib/session"
import { ScrubBar } from "./scrub-bar"

/** Transport buttons, skip-non-music, and the volume bar. */
export function PlayerControls({
	data,
	session,
	volumeLabel,
}: {
	data: SongReply
	session: GuildSession
	volumeLabel: number
}) {
	async function run(action: PlainSongAction) {
		if (await editSong(session, action)) {
			toast(FormatSongEditType[action])
		} else {
			toast("Failed to run")
		}
		await mutate(songKey(session.guildId))
	}

	async function toggleLoop() {
		if (await editSong(session, SongEditType.Loop, { loop: !data.loop })) {
			toast(FormatSongEditType[SongEditType.Loop])
		} else {
			toast("Failed to run")
		}
		await mutate(songKey(session.guildId))
	}

	async function setVolume(volume: number) {
		if (
			!(await editSong(session, SongEditType.SetVolume, {
				volume: Number.parseFloat(volume.toFixed(3)),
			}))
		) {
			return toast("Failed to set volume")
		}
		mutate(songKey(session.guildId))
	}

	return (
		<div className="flex flex-col gap-2 justify-center items-center">
			<div className="flex gap-2 items-center justify-between max-w-full w-max flex-wrap md:*:w-full md:flex-nowrap">
				{data.song && (
					<>
						{data.paused ? (
							<Button onClick={() => run(SongEditType.Resume)}>
								<ResumeIcon />
							</Button>
						) : (
							<Button onClick={() => run(SongEditType.Pause)}>
								<PauseIcon />
							</Button>
						)}
						<Button onClick={() => run(SongEditType.Skip)}>
							<TrackNextIcon />
						</Button>
					</>
				)}
				<Button onClick={toggleLoop}>
					{data.loop ? <LoopIcon /> : <ReloadIcon />}
				</Button>
				<Button onClick={() => run(SongEditType.Stop)}>
					<StopIcon />
				</Button>
				<Button
					onClick={() =>
						run(
							data.isMuting
								? SongEditType.Unmute
								: SongEditType.Mute,
						)
					}
				>
					{data.isMuting ? <SpeakerLoudIcon /> : <SpeakerOffIcon />}
				</Button>
				<Button onClick={() => run(SongEditType.Quit)}>
					<ExitIcon />
				</Button>
			</div>
			{data.skipToTimestamp && (
				<Button
					onClick={() => run(SongEditType.SkipSegment)}
					className="w-full"
				>
					<span className="mr-2">Skip Non-Music</span>
					<DoubleArrowRightIcon />
				</Button>
			)}
			<div className="w-full">
				<div className="flex gap-2 items-center">
					<Label>Volume</Label>
					{data.isMuting && <SpeakerOffIcon />}
				</div>
				<div className="flex gap-2 items-center">
					<ScrubBar
						now={data.volume}
						totalValue={1}
						onRelease={setVolume}
						enabled
						formatter={v => `${(v * 100).toFixed(1)}%`}
					/>
					<Label>{volumeLabel.toFixed(1)}%</Label>
				</div>
			</div>
		</div>
	)
}
