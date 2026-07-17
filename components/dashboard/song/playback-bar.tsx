"use client"
import {
	ExitIcon,
	LoopIcon,
	PauseIcon,
	PlayIcon,
	ShuffleIcon,
	SpeakerLoudIcon,
	SpeakerOffIcon,
	StopIcon,
	TrackNextIcon,
} from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { usePlaybackTime, usePlayer } from "@/hooks/use-player"
import { editSong, songKey, type PlainSongAction } from "@/lib/api/songs"
import { FormatSongEditType, SongEditType } from "@/lib/api/types"
import { formatClock } from "@/lib/format"
import { cn } from "@/lib/utils"
import { ScrubBar } from "./scrub-bar"

/**
 * Persistent bottom playback bar: mini track info, transport controls, seek and
 * volume — the always-visible control surface of the player.
 */
export function PlaybackBar({ guildId }: { guildId: string }) {
	const { data } = usePlayer(guildId)
	const time = usePlaybackTime(data)
	if (!data) return null

	async function run(action: PlainSongAction) {
		if (await editSong(guildId, action)) toast(FormatSongEditType[action])
		else toast("Failed to run")
		await mutate(songKey(guildId))
	}
	async function toggle<T extends Record<string, boolean>>(
		action: SongEditType,
		detail: T,
	) {
		if (await editSong(guildId, action as never, detail as never)) {
			toast(FormatSongEditType[action])
		} else toast("Failed to run")
		await mutate(songKey(guildId))
	}
	async function seek(seconds: number) {
		if (!(await editSong(guildId, SongEditType.SetTime, { sec: Math.round(seconds) }))) {
			toast("Failed to seek")
		}
		mutate(songKey(guildId))
	}
	async function setVolume(volume: number) {
		if (
			!(await editSong(guildId, SongEditType.SetVolume, {
				volume: Number.parseFloat(volume.toFixed(3)),
			}))
		) {
			toast("Failed to set volume")
		}
		mutate(songKey(guildId))
	}

	const duration = data.song?.duration ?? 0

	return (
		<div className="border-t border-white/10 bg-zinc-950/80 backdrop-blur px-4 py-3">
			<div className="mx-auto max-w-5xl flex flex-col gap-2">
				{/* seek */}
				<div className="flex items-center gap-3 text-xs tabular-nums text-zinc-400">
					<span className="w-10 text-right">{formatClock(Math.max(time, 0))}</span>
					<div className="flex-1">
						<ScrubBar
							now={Math.max(time, 0)}
							totalValue={duration || 1}
							enabled={data.canSeek && !!data.song}
							onRelease={seek}
							formatter={formatClock}
						/>
					</div>
					<span className="w-10">{formatClock(duration)}</span>
				</div>
				{/* transport + volume */}
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1 flex-1">
						{data.song &&
							(data.paused ? (
								<Button size="icon" onClick={() => run(SongEditType.Resume)}>
									<PlayIcon />
								</Button>
							) : (
								<Button size="icon" onClick={() => run(SongEditType.Pause)}>
									<PauseIcon />
								</Button>
							))}
						{data.song && (
							<Button variant="ghost" size="icon" onClick={() => run(SongEditType.Skip)}>
								<TrackNextIcon />
							</Button>
						)}
						<Button variant="ghost" size="icon" onClick={() => run(SongEditType.Stop)}>
							<StopIcon />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={cn(data.loop && "text-indigo-400")}
							onClick={() => toggle(SongEditType.Loop, { loop: !data.loop })}
							title="Loop"
						>
							<LoopIcon />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={cn(data.autoSuggest && "text-indigo-400")}
							onClick={() =>
								toggle(SongEditType.AutoSuggest, { autoSuggest: !data.autoSuggest })
							}
							title="Radio (autoplay suggestions)"
						>
							<ShuffleIcon />
						</Button>
					</div>
					<div className="flex items-center gap-2 w-40">
						<Button
							variant="ghost"
							size="icon"
							onClick={() =>
								run(data.isMuting ? SongEditType.Unmute : SongEditType.Mute)
							}
						>
							{data.isMuting ? <SpeakerOffIcon /> : <SpeakerLoudIcon />}
						</Button>
						<div className="flex-1">
							<ScrubBar
								now={data.volume}
								totalValue={1}
								enabled
								onRelease={setVolume}
								formatter={v => `${(v * 100).toFixed(0)}%`}
							/>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="text-zinc-400 hover:text-red-400"
						onClick={() => run(SongEditType.Quit)}
						title="Disconnect bot"
					>
						<ExitIcon />
					</Button>
				</div>
			</div>
		</div>
	)
}
