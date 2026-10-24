"use client"
import {
	LoopIcon,
	MinusIcon,
	PlusIcon,
	SwitchIcon,
	TrackNextIcon,
	TrashIcon,
} from "@radix-ui/react-icons"
import { Fragment, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useNow } from "@/hooks/use-now"
import { usePlaybackTime, usePlayer } from "@/hooks/use-player"
import {
	addMixSong,
	editSong,
	moveMixSong,
	songKey,
	type MixError,
	type TrackSettings,
} from "@/lib/api/songs"
import {
	isYoutubeVideoUrl,
	MAX_MIX_TRACKS,
	SongEditType,
	type MixTrack,
	type SongReply,
} from "@/lib/api/types"
import { searchYoutube } from "@/lib/api/videos"
import { cn } from "@/lib/utils"
import { Clip, Gap, QueueClip, type DragSong } from "./clip"
import {
	Fader,
	GapInput,
	GhostClip,
	LaneButton,
	LaneRow,
	Playhead,
	SnapLine,
	type Ghost,
} from "./lane"
import {
	DEFAULT_ZOOM,
	END_PX,
	gapBefore,
	LANE_COLOURS,
	LANE_DOTS,
	PAST_PX,
	place,
	QUEUE_COLOUR,
	rulerLabel,
	rulerStep,
	snap,
	trackClock,
	trackSeconds,
	UNKNOWN_SECONDS,
	ZOOMS,
	type Span,
} from "./timeline"

const ERROR_TEXT: Record<MixError, string> = {
	not_native: "Mixing needs the bot's Rust voice engine (USE_RUST_VOICE), which is off",
	not_connected: "The bot needs to be in a voice channel to mix",
	full: "The mix has all the tracks it can — queue on a track or remove one",
	not_found: "Couldn't find that — it may have moved or ended",
	failed: "Couldn't do that, try again",
}

/**
 * Where a dragged song would land, worked out as it moves: a lane by id
 * (`null` the queue, `"new"` a new track), its index there with it taken out,
 * the silence before it, and what to draw — the ghost on that lane, and the
 * edge it snapped to across all of them.
 */
interface Landing {
	lane: string | null
	index?: number
	gapMs?: number
	ghost: Ghost
	snapPx: number | null
}

/**
 * The mix as a track editor. The guild's queue is the top lane and every mix
 * track a lane under it, each playing one song at a time, with its own volume,
 * gap and loop. Time runs left to right past a fixed playhead; songs can be
 * dragged along a lane, between lanes, or out to a new one.
 */
export function TrackEditor({ guildId }: { guildId: string }) {
	const { data } = usePlayer(guildId, 1000)
	if (!data) {
		return <p className="py-10 text-center text-sm text-zinc-500 italic">Loading the mix…</p>
	}
	if (!data.canMix) {
		return <p className="py-10 text-center text-sm text-zinc-500 italic">{ERROR_TEXT.not_native}</p>
	}
	if (!data.mix?.tracks) {
		return (
			<p className="py-10 text-center text-sm text-zinc-500 italic">
				This bot predates mix tracks — update it to edit the mix here.
			</p>
		)
	}
	return <Editor data={data} tracks={data.mix.tracks} guildId={guildId} />
}

function Editor({
	data,
	tracks,
	guildId,
}: {
	data: SongReply
	tracks: MixTrack[]
	guildId: string
}) {
	const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM)
	const [dragging, setDragging] = useState<DragSong | null>(null)
	const [landing, setLanding] = useState<Landing | null>(null)
	const [busy, setBusy] = useState<string | null>(null)
	const now = useNow(true, 250)
	const queueSeconds = usePlaybackTime(data)

	const mix = data.mix!
	const maxTracks = mix.maxTracks ?? MAX_MIX_TRACKS
	const full = tracks.length >= maxTracks
	// Positions are as of the reply; counted on from it unless paused, when
	// the bot holds every track still
	const elapsedMs = data.paused ? 0 : Math.max(0, now - (data.receivedAt ?? now))

	const queueAhead =
		(data.song ? Math.max(0, data.song.duration - queueSeconds) : 0) +
		data.queue.length * UNKNOWN_SECONDS
	const longest = Math.max(queueAhead, ...tracks.map(track => trackSeconds(track, elapsedMs)))
	const width = PAST_PX + longest * zoom + END_PX

	const refresh = () => mutate(songKey(guildId))

	async function act(key: string, run: () => Promise<boolean>, failure: string) {
		if (busy) return
		setBusy(key)
		try {
			if (!(await run())) toast(failure)
			await refresh()
		} finally {
			setBusy(null)
		}
	}

	const setTrack = (track: MixTrack, settings: TrackSettings) =>
		act(
			`set:${track.id}`,
			() => editSong(guildId, SongEditType.SetMixTrack, { track: track.id, ...settings }),
			"That track is gone",
		)

	/**
	 * Follow a drag over a lane's timeline: snap the song's start or end to
	 * the nearest edge of a song on any lane, then work out where on this
	 * lane that puts it. Read from the lanes as drawn, so it snaps to what is
	 * on screen, durations looked up for the queue included.
	 */
	function dragAt(lane: string | null, clientX: number, timeline: HTMLElement) {
		const lanes = timeline.closest("[data-lanes]")
		if (!dragging || !lanes) return
		const timelines = [...lanes.querySelectorAll<HTMLElement>("[data-lane-timeline]")]
		const edges = [PAST_PX, ...timelines.flatMap(each => spansIn(each).flatMap(span => [span.left, span.right]))]
		const pointer = clientX - timeline.getBoundingClientRect().left - dragging.grabPx
		const snapped = snap(pointer, dragging.widthPx, edges)
		const placed =
			lane === "new"
				? (() => {
						const left = Math.max(snapped.start, PAST_PX)
						return { left, gapMs: Math.round(((left - PAST_PX) / zoom) * 1000) }
					})()
				: place(snapped.start, spansIn(timeline), zoom, { gaps: lane !== null })
		// A start held back by the song before it no longer sits on the edge
		const onEdge = Math.abs(placed.left - snapped.start) < 0.5
		setLanding({
			lane,
			index: "index" in placed ? placed.index : undefined,
			gapMs: placed.gapMs,
			ghost: { left: placed.left, width: dragging.widthPx },
			snapPx: onEdge ? snapped.edge : null,
		})
	}

	function endDrag() {
		setDragging(null)
		setLanding(null)
	}

	async function drop() {
		const from = dragging
		const to = landing
		endDrag()
		if (!from || !to) return
		const mixing = from.track === null && to.lane !== null
		const toastId = mixing ? toast("Mixing in…") : null
		const result = await moveMixSong(
			guildId,
			{ track: from.track, index: from.index },
			{ track: to.lane, index: to.index, gapMs: to.gapMs },
			from.url,
		)
		if (toastId !== null) toast.dismiss(toastId)
		if ("error" in result) toast(ERROR_TEXT[result.error])
		refresh()
	}

	const dragFor = (track: string | null, index: number) => ({
		track,
		index,
		onStart: setDragging,
		onEnd: endDrag,
	})
	const isDragged = (track: string | null, index: number) =>
		dragging?.track === track && dragging.index === index
	/** What a lane needs to take drops and show where one would land. */
	const dropFor = (lane: string | null) =>
		dragging
			? {
					onDragAt: (clientX: number, timeline: HTMLElement) => dragAt(lane, clientX, timeline),
					onDrop: drop,
					ghost: landing?.lane === lane ? landing.ghost : null,
					snapPx: landing?.snapPx ?? null,
				}
			: {}

	return (
		<div className="flex h-full min-h-0 flex-col gap-3">
			<Toolbar
				guildId={guildId}
				tracks={tracks}
				full={full}
				maxTracks={maxTracks}
				zoom={zoom}
				onZoom={setZoom}
				onChanged={refresh}
			/>

			<div className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10 bg-zinc-950">
				<div data-lanes className="w-max min-w-full">
					<Ruler width={width} zoom={zoom} seconds={longest} snapPx={landing?.snapPx ?? null} />

					<LaneRow
						width={width}
						offsetPx={PAST_PX - (data.song ? queueSeconds * zoom : 0)}
						{...dropFor(null)}
						header={
							<>
								<div className="flex items-center gap-1.5">
									<span className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400" />
									<span className="truncate text-sm font-medium">Queue</span>
									<span className="ml-auto flex">
										<LaneButton
											label="Skip the queue's song"
											disabled={!data.isPlaying}
											busy={busy === "skip:queue"}
											onClick={() =>
												act("skip:queue", () => editSong(guildId, SongEditType.Skip), "Couldn't skip")
											}
										>
											<TrackNextIcon />
										</LaneButton>
									</span>
								</div>
								<Fader
									volume={mix.mainVolume}
									label="The queue's volume in the mix"
									onRelease={volume =>
										act(
											"volume:queue",
											() =>
												editSong(guildId, SongEditType.SetMainVolume, {
													volume: Math.round(volume * 100) / 100,
												}),
											"Couldn't set the volume",
										)
									}
								/>
								<p className="truncate text-[11px] text-zinc-500">
									{data.queue.length} queued · the player&apos;s volume is the master
								</p>
							</>
						}
					>
						{data.song && (
							<Clip
								title={data.song.title ?? data.song.link}
								url={data.song.link}
								durationMs={data.song.duration * 1000}
								playedMs={queueSeconds * 1000}
								zoom={zoom}
								colour={QUEUE_COLOUR}
							/>
						)}
						{data.queue.map((item, index) => (
							<QueueClip
								key={`${item.url}:${index}`}
								url={item.url}
								zoom={zoom}
								colour={QUEUE_COLOUR}
								drag={dragFor(null, index)}
								dragging={isDragged(null, index)}
								onRemove={() =>
									act(
										`remove:queue:${index}`,
										() => editSong(guildId, SongEditType.RemoveSong, { index }),
										"Couldn't remove that song",
									)
								}
							/>
						))}
					</LaneRow>

					{tracks.map((track, position) => {
						const { positionMs, dueInMs } = trackClock(track, elapsedMs)
						const colour = LANE_COLOURS[position % LANE_COLOURS.length]
						return (
							<LaneRow
								key={track.id}
								width={width}
								offsetPx={PAST_PX - (track.playing ? (positionMs / 1000) * zoom : 0)}
								{...dropFor(track.id)}
								header={
									<TrackHeader
										track={track}
										position={position + 1}
										busy={busy}
										canSwap={data.isPlaying && Boolean(track.playing)}
										onSet={settings => setTrack(track, settings)}
										onSkip={() =>
											act(
												`skip:${track.id}`,
												() => editSong(guildId, SongEditType.SkipMixTrack, { track: track.id }),
												"Couldn't skip",
											)
										}
										onSwap={() =>
											act(
												`swap:${track.id}`,
												() => editSong(guildId, SongEditType.SwapMixTrack, { track: track.id }),
												"Couldn't swap that song in",
											)
										}
										onRemove={() =>
											act(
												`remove:${track.id}`,
												() => editSong(guildId, SongEditType.RemoveMixTrack, { track: track.id }),
												"That track is gone",
											)
										}
									/>
								}
							>
								{track.playing && (
									<Clip
										title={track.playing.title}
										url={track.playing.url}
										durationMs={track.playing.durationMs}
										playedMs={positionMs}
										zoom={zoom}
										colour={colour}
									/>
								)}
								{!track.playing && track.loading && (
									<Clip
										title={track.loading.title}
										url={track.loading.url}
										durationMs={track.loading.durationMs}
										zoom={zoom}
										colour={colour}
										loading
									/>
								)}
								{!track.playing && !track.loading && dueInMs !== null && (
									<Gap ms={dueInMs} zoom={zoom} />
								)}
								{track.queue.map((song, index) => (
									<Fragment key={`${song.url}:${index}`}>
										{(index > 0 || track.playing || track.loading) && (
											<Gap ms={gapBefore(track, index)} zoom={zoom} />
										)}
										<Clip
											title={song.title}
											url={song.url}
											durationMs={song.durationMs}
											zoom={zoom}
											colour={colour}
											drag={dragFor(track.id, index)}
											dragging={isDragged(track.id, index)}
											onRemove={() =>
												act(
													`remove:${track.id}:${index}`,
													() =>
														editSong(guildId, SongEditType.RemoveMixSong, {
															track: track.id,
															index,
															url: song.url,
														}),
													"Couldn't remove that song",
												)
											}
										/>
									</Fragment>
								))}
								{track.loop && (track.playing || track.queue.length > 0) && (
									<span className="my-auto ml-2 flex shrink-0 items-center gap-1 text-[10px] tracking-wide text-zinc-500 uppercase">
										<LoopIcon /> repeats
									</span>
								)}
							</LaneRow>
						)
					})}

					<NewTrackRow
						width={width}
						full={full}
						dragActive={dragging !== null}
						{...dropFor("new")}
						onAdd={() =>
							act(
								"add-track",
								() => editSong(guildId, SongEditType.AddMixTrack, {}),
								ERROR_TEXT.full,
							)
						}
						busy={busy === "add-track"}
					/>
				</div>
			</div>
		</div>
	)
}

/** A mix track's controls: its number, loop, skip, swap, remove, volume and gap. */
function TrackHeader({
	track,
	position,
	busy,
	canSwap,
	onSet,
	onSkip,
	onSwap,
	onRemove,
}: {
	track: MixTrack
	position: number
	busy: string | null
	canSwap: boolean
	onSet: (settings: TrackSettings) => void
	onSkip: () => void
	onSwap: () => void
	onRemove: () => void
}) {
	const waiting = track.queue.length
	return (
		<>
			<div className="flex items-center gap-1.5">
				<span
					className={cn(
						"h-2.5 w-2.5 shrink-0 rounded-full",
						LANE_DOTS[(position - 1) % LANE_DOTS.length],
					)}
				/>
				<span className="truncate text-sm font-medium">
					{/* The lane header is narrow on a phone, and the buttons need the room */}
					<span className="hidden sm:inline">Track </span>
					<span className="sm:hidden">T</span>
					{position}
				</span>
				<span className="ml-auto flex">
					<LaneButton
						label={track.loop ? "Stop looping" : "Loop this track's queue"}
						active={track.loop}
						busy={busy === `set:${track.id}`}
						onClick={() => onSet({ loop: !track.loop })}
					>
						<LoopIcon />
					</LaneButton>
					<LaneButton
						label="Skip to this track's next song"
						disabled={!track.playing && !waiting}
						busy={busy === `skip:${track.id}`}
						onClick={onSkip}
					>
						<TrackNextIcon />
					</LaneButton>
					<LaneButton
						label="Swap with the queue's song"
						disabled={!canSwap}
						busy={busy === `swap:${track.id}`}
						onClick={onSwap}
					>
						<SwitchIcon />
					</LaneButton>
					<LaneButton
						label="Remove this track"
						danger
						busy={busy === `remove:${track.id}`}
						onClick={onRemove}
					>
						<TrashIcon />
					</LaneButton>
				</span>
			</div>
			<Fader
				volume={track.volume}
				label={`Track ${position}'s volume`}
				onRelease={volume => onSet({ volume: Math.round(volume * 100) / 100 })}
			/>
			<GapInput gapMs={track.gapMs} onCommit={gapMs => onSet({ gapMs })} />
		</>
	)
}

/** Seconds from now along the top, with the playhead's "now" marked. */
function Ruler({
	width,
	zoom,
	seconds,
	snapPx,
}: {
	width: number
	zoom: number
	seconds: number
	snapPx: number | null
}) {
	const step = rulerStep(zoom)
	const first = -Math.floor(PAST_PX / zoom / step) * step
	const last = seconds + END_PX / zoom
	const ticks: number[] = []
	for (let t = first; t <= last; t += step) ticks.push(t)
	return (
		<div className="sticky top-0 z-30 flex border-b border-white/10 bg-zinc-900">
			<div className="sticky left-0 z-20 flex h-7 w-44 shrink-0 items-center border-r border-white/10 bg-zinc-900 px-2.5 text-[11px] text-zinc-500 sm:w-60">
				Lanes
			</div>
			<div className="relative h-7 shrink-0 overflow-hidden" style={{ width }}>
				{ticks.map(t => (
					<div
						key={t}
						className="absolute inset-y-0 border-l border-white/10 pl-1 text-[10px] leading-7 text-zinc-500 tabular-nums"
						style={{ left: PAST_PX + t * zoom }}
					>
						{rulerLabel(t)}
					</div>
				))}
				<Playhead />
				<SnapLine snapPx={snapPx} />
			</div>
		</div>
	)
}

/**
 * The last row: add an empty track, or drop a song on it for a track of its
 * own, starting where it was dropped.
 */
function NewTrackRow({
	width,
	full,
	dragActive,
	busy,
	onAdd,
	onDragAt,
	onDrop,
	ghost,
	snapPx,
}: {
	width: number
	full: boolean
	dragActive: boolean
	busy: boolean
	onAdd: () => void
	onDragAt?: (clientX: number, timeline: HTMLElement) => void
	onDrop?: () => void
	ghost?: Ghost | null
	snapPx?: number | null
}) {
	const droppable = dragActive && !full
	return (
		<div className="flex">
			<div className="sticky left-0 z-20 flex h-16 w-44 shrink-0 items-center border-r border-white/10 bg-zinc-950 px-2.5 sm:w-60">
				<Button
					variant="ghost"
					size="sm"
					disabled={full || busy}
					onClick={onAdd}
					className="text-zinc-400 hover:text-white"
				>
					<PlusIcon className="mr-1.5" />
					{full ? "No room for more tracks" : "Add track"}
				</Button>
			</div>
			<div
				data-lane-timeline
				className="relative h-16 shrink-0 overflow-hidden"
				style={{ width }}
				onDragOver={event => {
					if (!droppable || !onDragAt) return
					event.preventDefault()
					onDragAt(event.clientX, event.currentTarget)
				}}
				onDrop={event => {
					if (!droppable || !onDrop) return
					event.preventDefault()
					onDrop()
				}}
			>
				<div
					className={cn(
						"absolute inset-2 flex items-center rounded-md border border-dashed px-3 text-xs text-zinc-500 transition-colors",
						droppable ? "border-indigo-400/60 text-indigo-300" : "border-white/10",
					)}
				>
					<span className="sticky left-64">
						{dragActive
							? full
								? "The mix has all the tracks it can"
								: "Drop here for a new track, starting where you let go"
							: "Drag a song here to give it a track of its own"}
					</span>
				</div>
				{droppable && ghost && <GhostClip ghost={ghost} />}
				<SnapLine snapPx={snapPx} />
			</div>
		</div>
	)
}

/** Queue a song on a track, or on a new one; and how close up the timeline is. */
function Toolbar({
	guildId,
	tracks,
	full,
	maxTracks,
	zoom,
	onZoom,
	onChanged,
}: {
	guildId: string
	tracks: MixTrack[]
	full: boolean
	maxTracks: number
	zoom: number
	onZoom: (zoom: number) => void
	onChanged: () => void
}) {
	const [input, setInput] = useState("")
	const [chosen, setTarget] = useState<string>("new")
	const [adding, setAdding] = useState(false)
	// A track that has gone falls back to a new one
	const target = chosen === "new" || tracks.some(track => track.id === chosen) ? chosen : "new"
	const blocked = target === "new" && full
	const zoomAt = ZOOMS.indexOf(zoom as (typeof ZOOMS)[number])

	async function submit(event: React.FormEvent) {
		event.preventDefault()
		const query = input.trim()
		if (!query || adding || blocked) return
		setAdding(true)
		try {
			let url = query
			if (!isYoutubeVideoUrl(query)) {
				const found = await searchYoutube(query).catch(() => null)
				if (!found?.url) {
					toast("Couldn't find that video")
					return
				}
				url = found.url
			}
			const result = await addMixSong(guildId, url, target === "new" ? undefined : target)
			if ("error" in result) {
				toast(ERROR_TEXT[result.error])
				return
			}
			setInput("")
			onChanged()
		} finally {
			setAdding(false)
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<form onSubmit={submit} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="YouTube link or search"
					className="min-w-48 flex-1 border-white/10 bg-white/5"
					value={input}
					onChange={event => setInput(event.target.value)}
					disabled={adding}
					autoComplete="off"
				/>
				<Select value={target} onValueChange={setTarget}>
					<SelectTrigger className="w-36 border-white/10 bg-white/5" aria-label="Track to queue on">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="new" disabled={full}>
							New track
						</SelectItem>
						{tracks.map((track, index) => (
							<SelectItem key={track.id} value={track.id}>
								Track {index + 1}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button type="submit" disabled={adding || blocked || !input.trim()}>
					<PlusIcon className="mr-1.5" />
					{adding ? "Adding…" : "Add"}
				</Button>
			</form>
			<div className="flex items-center gap-1 text-xs text-zinc-500">
				<span className="mr-1 tabular-nums">
					{tracks.length}/{maxTracks} tracks
				</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					aria-label="Zoom out"
					title="Zoom out"
					disabled={zoomAt <= 0}
					onClick={() => onZoom(ZOOMS[zoomAt - 1])}
				>
					<MinusIcon />
				</Button>
				<span className="w-14 text-center tabular-nums">{zoom} px/s</span>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					aria-label="Zoom in"
					title="Zoom in"
					disabled={zoomAt >= ZOOMS.length - 1}
					onClick={() => onZoom(ZOOMS[zoomAt + 1])}
				>
					<PlusIcon />
				</Button>
			</div>
		</div>
	)
}

/** The songs drawn on a lane's timeline, the one being dragged left out. */
function spansIn(timeline: HTMLElement): Span[] {
	const origin = timeline.getBoundingClientRect().left
	return [...timeline.querySelectorAll<HTMLElement>("[data-clip]")]
		.filter(clip => !clip.dataset.dragging)
		.map(clip => {
			const rect = clip.getBoundingClientRect()
			return {
				left: rect.left - origin,
				right: rect.right - origin,
				kind: clip.dataset.clip === "queued" ? "queued" : "fixed",
			}
		})
}
