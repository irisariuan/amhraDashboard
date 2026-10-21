"use client"
import { ClockIcon, Cross2Icon, TrackNextIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNow } from "@/hooks/use-now"
import { addSchedule, respondToSchedule, type ScheduleError } from "@/lib/api/schedule"
import { songKey } from "@/lib/api/songs"
import { isYoutubeVideoUrl, type ScheduledPlay } from "@/lib/api/types"
import { formatCountdown, formatScheduleDate } from "@/lib/format"
import { cn } from "@/lib/utils"

const ERROR_TEXT: Record<ScheduleError, string> = {
	not_connected: "The bot needs to be in a voice channel to schedule",
	need_time: "Pick a time — only upcoming premieres can be scheduled without one",
	not_found: "Couldn't find that video",
	invalid: "That time has already passed",
}

async function respond(guildId: string, entry: ScheduledPlay, action: "cancel" | "queue") {
	if (await respondToSchedule(guildId, entry.id, action)) {
		toast(
			action === "queue"
				? `"${entry.title}" will play next instead`
				: `Cancelled "${entry.title}"`,
		)
	} else {
		toast("Too late — it has already started")
	}
	mutate(songKey(guildId))
}

/**
 * Scheduled plays: a form to add one and the list of what is pending.
 *
 * A scheduled video interrupts whatever is playing at its time, after a
 * ten-second warning in Discord and here; the interrupted song resumes after.
 */
export function Schedules({
	guildId,
	schedules,
	isPlaying,
}: {
	guildId: string
	schedules: ScheduledPlay[]
	isPlaying: boolean
}) {
	const [url, setUrl] = useState("")
	const [time, setTime] = useState("")
	const [busy, setBusy] = useState(false)
	const now = useNow(schedules.length > 0)

	const validUrl = isYoutubeVideoUrl(url)

	async function submit(event: React.FormEvent) {
		event.preventDefault()
		if (!validUrl || busy) return
		// datetime-local has no zone; Date reads it in the viewer's, which is
		// what they meant when they picked it
		const at = time ? new Date(time).getTime() : undefined
		if (at !== undefined && at <= Date.now()) {
			toast(ERROR_TEXT.invalid)
			return
		}
		setBusy(true)
		try {
			const result = await addSchedule(guildId, url.trim(), at)
			if ("error" in result) {
				toast(ERROR_TEXT[result.error])
				return
			}
			toast(
				result.entry.premiere && at === undefined
					? `Premiere scheduled for ${formatScheduleDate(result.entry.at)}`
					: `Scheduled "${result.entry.title}" for ${formatScheduleDate(result.entry.at)}`,
			)
			setUrl("")
			setTime("")
			mutate(songKey(guildId))
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="flex flex-col gap-3">
			<form onSubmit={submit} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
				<Input
					placeholder="YouTube video or premiere link"
					className="bg-white/5 border-white/10"
					value={url}
					onChange={event => setUrl(event.target.value)}
					disabled={busy}
					autoComplete="off"
				/>
				<div className="flex flex-wrap items-center gap-2">
					<Input
						type="datetime-local"
						aria-label="Time to cut in"
						className="min-w-0 flex-1 bg-white/5 border-white/10 [color-scheme:dark]"
						value={time}
						onChange={event => setTime(event.target.value)}
						disabled={busy}
					/>
					<Button type="submit" disabled={busy || !validUrl}>
						<ClockIcon className="mr-1.5" />
						Schedule
					</Button>
				</div>
				<p className="text-xs text-zinc-500">
					It cuts in over whatever is playing, with a 10-second warning to stop it. Leave the
					time empty for an upcoming premiere to start it when the premiere does.
				</p>
			</form>

			{schedules.length === 0 ? (
				<p className="text-zinc-500 italic text-sm px-2 py-6 text-center">
					Nothing is scheduled
				</p>
			) : (
				<div className="flex flex-col gap-1">
					{schedules.map(entry => (
						<div
							key={entry.id}
							className={cn(
								"group flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5 active:bg-white/5",
								entry.warning && "bg-amber-500/10",
							)}
						>
							<div className="flex-1 min-w-0 overflow-hidden">
								<a
									href={entry.url}
									target="_blank"
									rel="noreferrer"
									className="block truncate text-sm hover:text-indigo-300 active:text-indigo-300"
								>
									{entry.title}
								</a>
								<span className="flex flex-wrap items-center gap-x-1.5 text-xs text-zinc-500">
									<span>{formatScheduleDate(entry.fireAt)}</span>
									<span>·</span>
									<span className={cn("tabular-nums", entry.warning && "text-amber-300")}>
										{entry.starting ? "starting…" : formatCountdown(entry.fireAt - now)}
									</span>
									{entry.premiere && (
										<span className="text-[10px] uppercase tracking-wide text-indigo-400">
											premiere
										</span>
									)}
								</span>
							</div>
							{!entry.starting && (
								<>
									{isPlaying && (
										<Button
											variant="ghost"
											size="icon"
											title="Play next instead"
											aria-label="Play next instead"
											className="text-zinc-400 hover:text-indigo-300 active:bg-accent active:text-indigo-300"
											onClick={() => respond(guildId, entry, "queue")}
										>
											<TrackNextIcon />
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										title="Cancel"
										aria-label="Cancel"
										className="text-zinc-400 hover:text-red-400 active:bg-accent active:text-red-400"
										onClick={() => respond(guildId, entry, "cancel")}
									>
										<Cross2Icon />
									</Button>
								</>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}

/**
 * The ten-second warning, shown over the whole player so it is seen whichever
 * tab is open. Mirrors the buttons the bot posts in Discord.
 */
export function ScheduleBanner({
	guildId,
	schedules,
	isPlaying,
}: {
	guildId: string
	schedules: ScheduledPlay[]
	isPlaying: boolean
}) {
	const entry = schedules.find(s => s.warning)
	const now = useNow(!!entry, 250)
	if (!entry) return null

	return (
		<div
			role="alert"
			className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3"
		>
			<ClockIcon className="h-5 w-5 flex-none text-amber-300" />
			<p className="min-w-0 flex-1 text-sm">
				<span className="font-medium text-amber-100">{entry.title}</span>{" "}
				<span className="text-amber-200/80">
					{isPlaying ? "cuts in" : "starts"}{" "}
					<span className="tabular-nums">{formatCountdown(entry.fireAt - now)}</span>
				</span>
			</p>
			<div className="flex gap-2">
				{isPlaying && (
					<Button size="sm" variant="secondary" onClick={() => respond(guildId, entry, "queue")}>
						Play next instead
					</Button>
				)}
				<Button size="sm" variant="destructive" onClick={() => respond(guildId, entry, "cancel")}>
					{isPlaying ? "Don't cut in" : "Cancel"}
				</Button>
			</div>
		</div>
	)
}
