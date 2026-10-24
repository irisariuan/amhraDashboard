import type { MixTrack } from "@/lib/api/types"

/**
 * The geometry of the track editor. Time runs left to right at `zoom` pixels
 * a second; the playhead stands still `PAST_PX` in from the left edge of the
 * lanes, and the songs slide past it as they play.
 */

/** How much of what has already played stays in view, left of the playhead. */
export const PAST_PX = 96
/** Room after the longest lane, to drop a song at the end of it. */
export const END_PX = 240
/** Pixels a second the editor offers, from overview to close up. */
export const ZOOMS = [0.5, 1, 2, 4, 8, 16] as const
export const DEFAULT_ZOOM = 2
/** How wide a song whose length the bot did not know is drawn. */
export const UNKNOWN_SECONDS = 180

/** Lane colours, one per track in order, so a track keeps its colour as others go. */
export const LANE_COLOURS = [
	"bg-sky-500/20 border-sky-400/50 text-sky-100",
	"bg-emerald-500/20 border-emerald-400/50 text-emerald-100",
	"bg-amber-500/20 border-amber-400/50 text-amber-100",
	"bg-rose-500/20 border-rose-400/50 text-rose-100",
	"bg-violet-500/20 border-violet-400/50 text-violet-100",
	"bg-teal-500/20 border-teal-400/50 text-teal-100",
	"bg-orange-500/20 border-orange-400/50 text-orange-100",
	"bg-fuchsia-500/20 border-fuchsia-400/50 text-fuchsia-100",
] as const
export const QUEUE_COLOUR = "bg-indigo-500/25 border-indigo-400/60 text-indigo-100"

export const LANE_DOTS = [
	"bg-sky-400",
	"bg-emerald-400",
	"bg-amber-400",
	"bg-rose-400",
	"bg-violet-400",
	"bg-teal-400",
	"bg-orange-400",
	"bg-fuchsia-400",
] as const

/** Ruler steps, in seconds; the first that leaves labels room to breathe is used. */
const STEPS = [5, 10, 15, 30, 60, 120, 300, 600, 1200]
const MIN_STEP_PX = 72

export function rulerStep(zoom: number) {
	return STEPS.find(step => step * zoom >= MIN_STEP_PX) ?? STEPS[STEPS.length - 1]
}

/** Seconds from now as a ruler label: `now`, `+1:30`, `−0:45`. */
export function rulerLabel(seconds: number) {
	if (seconds === 0) return "now"
	const sign = seconds < 0 ? "−" : "+"
	const total = Math.abs(Math.round(seconds))
	const m = Math.floor(total / 60)
	const s = total % 60
	return `${sign}${m}:${s.toString().padStart(2, "0")}`
}

/** A song's length in seconds, or the stand-in for one not known. */
export function songSeconds(durationMs: number | null | undefined) {
	return durationMs ? durationMs / 1000 : UNKNOWN_SECONDS
}

/**
 * Where a mix track is, counted on from the bot's reply by the time since it
 * arrived: how far into its song, and how long until its next one starts.
 */
export function trackClock(track: MixTrack, elapsedMs: number) {
	const length = track.playing?.durationMs ?? Number.POSITIVE_INFINITY
	return {
		positionMs: track.playing ? Math.min(track.playing.positionMs + elapsedMs, length) : 0,
		dueInMs: track.dueInMs === null ? null : Math.max(0, track.dueInMs - elapsedMs),
	}
}

/** Seconds a mix track has ahead of it, for sizing the editor. */
export function trackSeconds(track: MixTrack, elapsedMs: number) {
	const { positionMs, dueInMs } = trackClock(track, elapsedMs)
	let seconds = 0
	if (track.playing) seconds += songSeconds(track.playing.durationMs) - positionMs / 1000
	else if (track.loading) seconds += songSeconds(track.loading.durationMs)
	else if (dueInMs !== null) seconds += dueInMs / 1000
	track.queue.forEach((song, index) => {
		// The wait before the first queued song is already counted when it is
		// waiting out the gap rather than playing
		if (index > 0 || track.playing || track.loading) seconds += gapBefore(track, index) / 1000
		seconds += songSeconds(song.durationMs)
	})
	return Math.max(0, seconds)
}

/** The silence before a queued song: its own, where it was placed, or the track's. */
export function gapBefore(track: MixTrack, index: number) {
	return track.queue[index]?.gapBeforeMs ?? track.gapMs
}

/** How close, in pixels, a dragged song's start or end has to come to an edge to snap to it. */
export const SNAP_PX = 10

/**
 * Snap a dragged song so its start, or failing that its end, lands on the
 * nearest edge — the start or end of a song on any lane, or now — when one
 * is within `SNAP_PX`. Positions are pixels from the lanes' left edge.
 */
export function snap(start: number, width: number, edges: readonly number[]) {
	let best: { start: number; edge: number; distance: number } | null = null
	for (const edge of edges) {
		for (const candidate of [edge, edge - width]) {
			const distance = Math.abs(candidate - start)
			if (distance <= SNAP_PX && (!best || distance < best.distance)) {
				best = { start: candidate, edge, distance }
			}
		}
	}
	return best ? { start: best.start, edge: best.edge } : { start, edge: null }
}

/** A song as laid out on a lane, in pixels from the lanes' left edge. */
export interface Span {
	left: number
	right: number
	/** "fixed" for the song playing or loading, "queued" for one that can move */
	kind: "fixed" | "queued"
}

/**
 * Where a song dropped to start at `start` lands on a lane: its index among
 * the lane's queued songs (the dragged one left out), where it will actually
 * start, and the silence before it. It can start no earlier than the song
 * before it ends; on a lane with nothing before it, no earlier than now. The
 * guild's queue plays back to back, so there it has no gap of its own.
 */
export function place(
	start: number,
	spans: readonly Span[],
	zoom: number,
	{ gaps }: { gaps: boolean },
): { index: number; left: number; gapMs?: number } {
	const queued = spans.filter(span => span.kind === "queued").sort((a, b) => a.left - b.left)
	const fixed = spans.filter(span => span.kind === "fixed").sort((a, b) => a.left - b.left)
	// A start snapped onto a song's own start goes in front of it
	const before = queued.filter(span => span.left < start)
	const previous = before.at(-1) ?? fixed.at(-1)
	const base = previous ? previous.right : PAST_PX
	if (!gaps) return { index: before.length, left: base }
	const left = Math.max(start, base)
	return { index: before.length, left, gapMs: Math.round(((left - base) / zoom) * 1000) }
}
