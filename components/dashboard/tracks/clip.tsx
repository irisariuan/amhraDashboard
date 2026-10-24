"use client"
import { Cross2Icon } from "@radix-ui/react-icons"
import { useVideoDetails } from "@/hooks/use-video-details"
import { formatClock } from "@/lib/format"
import { cn } from "@/lib/utils"
import { PAST_PX, songSeconds } from "./timeline"

/** What a drag carries: where the song was, which song, and where it was held. */
export interface DragSong {
	track: string
	index: number
	url: string
	/** How far into the clip it was picked up, so it lands under the pointer */
	grabPx: number
	widthPx: number
}

/** A queued song's drag wiring; absent on what cannot move. */
export interface ClipDrag {
	track: string
	index: number
	onStart: (song: DragSong) => void
	onEnd: () => void
}

/**
 * One song on a lane, as wide as it is long. A playing song shades the part
 * already played; a queued one can be dragged elsewhere.
 *
 * The editor snaps and places drops by reading the lanes as laid out, so each
 * clip says what it is: `data-clip` is "fixed" for the song playing or
 * loading and "queued" for one that can still move.
 */
export function Clip({
	title,
	url,
	durationMs,
	zoom,
	colour,
	playedMs,
	loading = false,
	dragging = false,
	drag,
	onRemove,
}: {
	title: string
	url: string
	durationMs: number | null
	zoom: number
	colour: string
	/** How much of it has played, for the song playing now */
	playedMs?: number
	loading?: boolean
	/** It is the one being dragged, and is left out of snapping and placing */
	dragging?: boolean
	drag?: ClipDrag
	onRemove?: () => void
}) {
	const seconds = songSeconds(durationMs)
	const width = Math.max(seconds * zoom, 6)
	// A playing song starts left of the playhead, and close up its start is
	// out of view: the label moves along to stay on the part that is shown.
	const labelInset =
		playedMs === undefined
			? 0
			: Math.max(0, Math.min((playedMs / 1000) * zoom - PAST_PX, width - 48))

	return (
		<div
			data-clip={drag ? "queued" : "fixed"}
			data-dragging={dragging || undefined}
			draggable={Boolean(drag)}
			onDragStart={event => {
				if (!drag) return
				const rect = event.currentTarget.getBoundingClientRect()
				event.dataTransfer.effectAllowed = "move"
				// Some browsers will not start a drag without data
				event.dataTransfer.setData("text/uri-list", url)
				drag.onStart({
					track: drag.track,
					index: drag.index,
					url,
					grabPx: event.clientX - rect.left,
					widthPx: rect.width,
				})
			}}
			onDragEnd={() => drag?.onEnd()}
			style={{ width }}
			title={`${title} · ${durationMs ? formatClock(durationMs / 1000) : "length unknown"}`}
			className={cn(
				"group/clip relative my-2 flex shrink-0 flex-col justify-between overflow-hidden rounded-md border px-2 py-1 text-xs select-none",
				colour,
				!durationMs && "border-dashed",
				drag && "cursor-grab active:cursor-grabbing",
				loading && "animate-pulse",
				dragging && "opacity-40",
			)}
		>
			{playedMs !== undefined && (
				<div
					className="pointer-events-none absolute inset-y-0 left-0 bg-black/45"
					style={{ width: (playedMs / 1000) * zoom }}
					aria-hidden
				/>
			)}
			<a
				href={url}
				target="_blank"
				rel="noreferrer"
				draggable={false}
				style={{ marginLeft: labelInset }}
				className="relative truncate font-medium hover:underline"
			>
				{title}
			</a>
			<span style={{ marginLeft: labelInset }} className="relative truncate tabular-nums opacity-70">
				{loading
					? "loading…"
					: playedMs !== undefined && durationMs
						? `${formatClock(playedMs / 1000)} / ${formatClock(durationMs / 1000)}`
						: durationMs
							? formatClock(durationMs / 1000)
							: "–:––"}
			</span>
			{onRemove && (
				<button
					type="button"
					onClick={onRemove}
					aria-label={`Remove ${title}`}
					title="Remove"
					className="absolute top-1 right-1 rounded bg-black/50 p-0.5 opacity-100 hover:text-red-300 sm:opacity-0 sm:group-hover/clip:opacity-100"
				>
					<Cross2Icon />
				</button>
			)}
		</div>
	)
}

/** A song the bot reports only by URL, as `/play` queues them: its title and length are looked up. */
export function QueueClip({
	url,
	...props
}: Omit<Parameters<typeof Clip>[0], "title" | "durationMs"> & { url: string }) {
	const { data } = useVideoDetails(url)
	return (
		<Clip
			{...props}
			url={url}
			title={data?.title ?? url}
			durationMs={data?.durationInSec ? data.durationInSec * 1000 : null}
		/>
	)
}

/** Silence between two songs on a queue, hatched so it reads as empty time. */
export function Gap({ ms, zoom }: { ms: number; zoom: number }) {
	if (ms <= 0) return null
	const width = (ms / 1000) * zoom
	return (
		<div
			style={{ width }}
			title={`${(ms / 1000).toFixed(1)}s of silence`}
			className="my-4 flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.07)_0_4px,transparent_4px_8px)] text-[10px] text-zinc-500"
		>
			{width >= 28 && `${Math.round(ms / 100) / 10}s`}
		</div>
	)
}
