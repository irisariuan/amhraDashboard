"use client"
import {
	LoopIcon,
	MinusIcon,
	PauseIcon,
	PlayIcon,
	PlusIcon,
	TrackNextIcon,
	TrashIcon,
} from "@radix-ui/react-icons"
import { Fragment, useRef, useState } from "react"
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
import { usePlayer } from "@/hooks/use-player"
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
	type MixSong,
	type MixTrack,
	type SearchHit,
	type SongReply,
} from "@/lib/api/types"
import { searchYoutube } from "@/lib/api/videos"
import { cn } from "@/lib/utils"
import { SearchResults, useYoutubeSearch } from "../song/search-results"
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
	leadIn,
	laneColour,
	laneDot,
	PAST_PX,
	place,
	rulerLabel,
	rulerStep,
	snap,
	trackClock,
	trackSeconds,
	ZOOMS,
	type Span,
} from "./timeline"

const ERROR_TEXT: Record<MixError, string> = {
	not_native: "More than one queue needs the bot's Rust voice engine (USE_RUST_VOICE), which is off",
	not_connected: "The bot needs to be in a voice channel to play more than one queue",
	full: "The bot has all the queues it can — add to a queue or remove one",
	not_found: "Couldn't find that — it may have moved or ended",
	rejected: "The bot didn't accept that — it may need updating",
	failed: "Couldn't do that, try again",
}

/**
 * Where a dragged song would land, worked out as it moves: a lane by its
 * queue's id (`"new"` a new queue), its index there with it taken out, the
 * silence before it, and what to draw — the ghost on that lane, and the edge
 * it snapped to across all of them.
 */
interface Landing {
	lane: string
	index?: number
	gapMs?: number
	ghost: Ghost
	snapPx: number | null
}

/**
 * Every queue the guild has, as a track editor: one lane each, queue 1 on
 * top, all alike — each plays one song at a time, with its own volume, gap,
 * loop and pause. Time runs left to right past a fixed playhead; songs can be
 * dragged along a lane, between lanes, or out to a new queue.
 */
export function TrackEditor({ guildId }: { guildId: string }) {
	const { data } = usePlayer(guildId, 1000)
	if (!data) {
		return <p className="py-10 text-center text-sm text-zinc-500 italic">Loading the queues…</p>
	}
	if (!data.canMix) {
		return <p className="py-10 text-center text-sm text-zinc-500 italic">{ERROR_TEXT.not_native}</p>
	}
	if (!data.queues?.length) {
		return (
			<p className="py-10 text-center text-sm text-zinc-500 italic">
				This bot predates equal queues — update it to edit them here.
			</p>
		)
	}
	return <Editor data={data} lanes={data.queues} guildId={guildId} />
}

function Editor({
	data,
	lanes,
	guildId,
}: {
	data: SongReply
	lanes: MixTrack[]
	guildId: string
}) {
	const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM)
	const [dragging, setDragging] = useState<DragSong | null>(null)
	const [landing, setLanding] = useState<Landing | null>(null)
	const [busy, setBusy] = useState<string | null>(null)
	const now = useNow(true, 250)

	// Queue 1 is not one of the mix's places
	const maxQueues = (data.mix?.maxTracks ?? MAX_MIX_TRACKS) + 1
	const full = lanes.length >= maxQueues
	// Positions are as of the reply; counted on from it, except on a lane
	// that is paused, which the bot holds still
	const sinceReply = Math.max(0, now - (data.receivedAt ?? now))
	const elapsedFor = (lane: MixTrack) => (lane.paused ? 0 : sinceReply)

	const longest = Math.max(...lanes.map(lane => trackSeconds(lane, elapsedFor(lane))))
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

	const setLane = (lane: MixTrack, settings: TrackSettings) =>
		act(
			`set:${lane.id}`,
			() => editSong(guildId, SongEditType.SetMixTrack, { track: lane.id, ...settings }),
			"That queue is gone",
		)

	/**
	 * Follow a drag over a lane's timeline: snap the song's start or end to
	 * the nearest edge of a song on any lane, then work out where on this
	 * lane that puts it. Read from the lanes as drawn, so it snaps to what is
	 * on screen, durations looked up for unnamed songs included.
	 */
	function dragAt(lane: string, clientX: number, timeline: HTMLElement) {
		const lanesEl = timeline.closest("[data-lanes]")
		if (!dragging || !lanesEl) return
		const timelines = [...lanesEl.querySelectorAll<HTMLElement>("[data-lane-timeline]")]
		const edges = [PAST_PX, ...timelines.flatMap(each => spansIn(each).flatMap(span => [span.left, span.right]))]
		const pointer = clientX - timeline.getBoundingClientRect().left - dragging.grabPx
		const snapped = snap(pointer, dragging.widthPx, edges)
		const placed: { left: number; gapMs: number; index?: number } =
			lane === "new" ? leadIn(snapped.start, PAST_PX, zoom) : place(snapped.start, spansIn(timeline), zoom)
		// A start held back by the song before it no longer sits on the edge
		const onEdge = Math.abs(placed.left - snapped.start) < 0.5
		setLanding({
			lane,
			index: placed.index,
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
		const result = await moveMixSong(
			guildId,
			{ track: from.track, index: from.index },
			{ track: to.lane, index: to.index, gapMs: to.gapMs },
			from.url,
		)
		if ("error" in result) toast(ERROR_TEXT[result.error])
		refresh()
	}

	const dragFor = (track: string, index: number) => ({
		track,
		index,
		onStart: setDragging,
		onEnd: endDrag,
	})
	const isDragged = (track: string, index: number) =>
		dragging?.track === track && dragging.index === index
	/** What a lane needs to take drops and show where one would land. */
	const dropFor = (lane: string) =>
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
				lanes={lanes}
				full={full}
				maxQueues={maxQueues}
				zoom={zoom}
				onZoom={setZoom}
				onChanged={refresh}
			/>

			<div className="min-h-0 flex-1 overflow-auto rounded-lg border border-white/10 bg-zinc-950">
				<div data-lanes className="w-max min-w-full">
					<Ruler width={width} zoom={zoom} seconds={longest} snapPx={landing?.snapPx ?? null} />

					{lanes.map(lane => {
						const { positionMs, dueInMs } = trackClock(lane, elapsedFor(lane))
						const colour = laneColour(lane.id)
						return (
							<LaneRow
								key={lane.id}
								width={width}
								offsetPx={PAST_PX - (lane.playing ? (positionMs / 1000) * zoom : 0)}
								{...dropFor(lane.id)}
								header={
									<LaneHeader
										lane={lane}
										busy={busy}
										onSet={settings => setLane(lane, settings)}
										onSkip={() =>
											act(
												`skip:${lane.id}`,
												() => editSong(guildId, SongEditType.SkipMixTrack, { track: lane.id }),
												"Couldn't skip",
											)
										}
										onRemove={
											// Queue 1 is the guild's own, and stays
											lane.id === "1"
												? undefined
												: () =>
														act(
															`remove:${lane.id}`,
															() => editSong(guildId, SongEditType.RemoveMixTrack, { track: lane.id }),
															"That queue is gone",
														)
										}
									/>
								}
							>
								{lane.playing && (
									<SongClip
										song={lane.playing}
										playedMs={positionMs}
										zoom={zoom}
										colour={colour}
									/>
								)}
								{!lane.playing && lane.loading && (
									<SongClip song={lane.loading} zoom={zoom} colour={colour} loading />
								)}
								{!lane.playing && !lane.loading && dueInMs !== null && (
									<Gap ms={dueInMs} zoom={zoom} />
								)}
								{lane.queue.map((song, index) => (
									<Fragment key={`${song.url}:${index}`}>
										{(index > 0 || lane.playing || lane.loading) && (
											<Gap ms={gapBefore(lane, index)} zoom={zoom} />
										)}
										<SongClip
											song={song}
											zoom={zoom}
											colour={colour}
											drag={dragFor(lane.id, index)}
											dragging={isDragged(lane.id, index)}
											onRemove={() =>
												act(
													`remove:${lane.id}:${index}`,
													() =>
														editSong(guildId, SongEditType.RemoveMixSong, {
															track: lane.id,
															index,
															url: song.url,
														}),
													"Couldn't remove that song",
												)
											}
										/>
									</Fragment>
								))}
								{lane.loop && (lane.playing || lane.queue.length > 0) && (
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

/**
 * A song on a lane. The bot names songs it looked up; one queued by `/play`
 * comes by URL alone, and its title and length are looked up here.
 */
function SongClip({
	song,
	...props
}: Omit<Parameters<typeof Clip>[0], "title" | "url" | "durationMs"> & { song: MixSong }) {
	if (song.title === null) return <QueueClip {...props} url={song.url} />
	return <Clip {...props} title={song.title} url={song.url} durationMs={song.durationMs} />
}

/** A queue's controls: its number, pause, loop, skip, remove, volume and gap. */
function LaneHeader({
	lane,
	busy,
	onSet,
	onSkip,
	onRemove,
}: {
	lane: MixTrack
	busy: string | null
	onSet: (settings: TrackSettings) => void
	onSkip: () => void
	/** Absent for queue 1, which cannot be removed */
	onRemove?: () => void
}) {
	const waiting = lane.queue.length
	const paused = lane.paused ?? false
	return (
		<>
			<div className="flex items-center gap-1.5">
				<span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", laneDot(lane.id))} />
				<span className="truncate text-sm font-medium">
					{/* The lane header is narrow on a phone, and the buttons need the room */}
					<span className="hidden sm:inline">Queue </span>
					<span className="sm:hidden">Q</span>
					{lane.id}
				</span>
				<span className="ml-auto flex">
					<LaneButton
						label={paused ? "Resume this queue" : "Pause this queue"}
						active={paused}
						disabled={!paused && !lane.playing && lane.dueInMs === null}
						busy={busy === `set:${lane.id}`}
						onClick={() => onSet({ paused: !paused })}
					>
						{paused ? <PlayIcon /> : <PauseIcon />}
					</LaneButton>
					<LaneButton
						label={lane.loop ? "Stop looping" : "Loop this queue"}
						active={lane.loop}
						busy={busy === `set:${lane.id}`}
						onClick={() => onSet({ loop: !lane.loop })}
					>
						<LoopIcon />
					</LaneButton>
					<LaneButton
						label="Skip to this queue's next song"
						disabled={!lane.playing && !waiting}
						busy={busy === `skip:${lane.id}`}
						onClick={onSkip}
					>
						<TrackNextIcon />
					</LaneButton>
					{onRemove && (
						<LaneButton
							label="Remove this queue"
							danger
							busy={busy === `remove:${lane.id}`}
							onClick={onRemove}
						>
							<TrashIcon />
						</LaneButton>
					)}
				</span>
			</div>
			<Fader
				volume={lane.volume}
				label={`Queue ${lane.id}'s volume, under the bot's`}
				onRelease={volume => onSet({ volume: Math.round(volume * 100) / 100 })}
			/>
			<GapInput gapMs={lane.gapMs} onCommit={gapMs => onSet({ gapMs })} />
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
 * The last row: add an empty queue, or drop a song on it for a queue of its
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
					{full ? "No room for more queues" : "Add queue"}
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
								? "The bot has all the queues it can"
								: "Drop here for a new queue, starting where you let go"
							: "Drag a song here to give it a queue of its own"}
					</span>
				</div>
				{droppable && ghost && <GhostClip ghost={ghost} />}
				<SnapLine snapPx={snapPx} />
			</div>
		</div>
	)
}

/** Add a song to a queue, or to a new one; and how close up the timeline is. */
function Toolbar({
	guildId,
	lanes,
	full,
	maxQueues,
	zoom,
	onZoom,
	onChanged,
}: {
	guildId: string
	lanes: MixTrack[]
	full: boolean
	maxQueues: number
	zoom: number
	onZoom: (zoom: number) => void
	onChanged: () => void
}) {
	const [input, setInput] = useState("")
	const [chosen, setTarget] = useState<string>("1")
	const [adding, setAdding] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	// A queue that has gone falls back to queue 1
	const target = chosen === "new" || lanes.some(lane => lane.id === chosen) ? chosen : "1"
	const blocked = target === "new" && full
	const zoomAt = ZOOMS.indexOf(zoom as (typeof ZOOMS)[number])
	const search = useYoutubeSearch(input, containerRef, !isYoutubeVideoUrl(input))

	/** A picked match, a link, or else the best match for what was typed */
	async function add(hit?: SearchHit) {
		const query = input.trim()
		if (!query || adding || blocked) return
		setAdding(true)
		search.setOpen(false)
		try {
			let url = hit?.url ?? query
			if (!hit && !isYoutubeVideoUrl(query)) {
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
			search.clear()
			onChanged()
		} finally {
			setAdding(false)
		}
	}

	function submit(event: React.FormEvent) {
		event.preventDefault()
		// A loaded dropdown already holds the answer, so do not search again
		add(search.chosen)
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<form onSubmit={submit} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
				<div ref={containerRef} className="relative min-w-48 flex-1">
					<Input
						placeholder="YouTube link or search"
						className="border-white/10 bg-white/5"
						value={input}
						onChange={event => setInput(event.target.value)}
						onFocus={() => search.hits.length && search.setOpen(true)}
						onKeyDown={search.onKeyDown}
						disabled={adding}
						autoComplete="off"
						aria-expanded={search.open}
						aria-autocomplete="list"
						role="combobox"
					/>
					<SearchResults search={search} disabled={adding || blocked} onPick={add} />
				</div>
				<Select value={target} onValueChange={setTarget}>
					<SelectTrigger className="w-36 border-white/10 bg-white/5" aria-label="Queue to add it to">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{lanes.map(lane => (
							<SelectItem key={lane.id} value={lane.id}>
								Queue {lane.id}
							</SelectItem>
						))}
						<SelectItem value="new" disabled={full}>
							New queue
						</SelectItem>
					</SelectContent>
				</Select>
				<Button type="submit" disabled={adding || blocked || !input.trim()}>
					<PlusIcon className="mr-1.5" />
					{adding ? "Adding…" : "Add"}
				</Button>
			</form>
			<div className="flex items-center gap-1 text-xs text-zinc-500">
				<span className="mr-1 tabular-nums">
					{lanes.length}/{maxQueues} queues
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
