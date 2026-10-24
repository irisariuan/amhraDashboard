"use client"
import { TimerIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { PAST_PX } from "./timeline"

/** Each lane's height, header and timeline alike, so the rows line up. */
export const LANE_CLASS = "h-28"

/** Where a dragged song would land on a lane, in pixels from the lanes' left edge. */
export interface Ghost {
	left: number
	width: number
}

/**
 * One row of the editor: its controls on the left, kept in view while the
 * timeline scrolls, and its songs sliding past the playhead on the right.
 * While a song is dragged over the timeline, the row reports where the
 * pointer is and shows where the song would land.
 */
export function LaneRow({
	header,
	width,
	offsetPx,
	onDragAt,
	onDrop,
	ghost,
	snapPx,
	children,
}: {
	header: React.ReactNode
	width: number
	/** Where the row's first song starts, from the timeline's left edge */
	offsetPx: number
	/** A drag is over the timeline at `clientX`; absent where nothing can be dropped */
	onDragAt?: (clientX: number, timeline: HTMLElement) => void
	onDrop?: () => void
	ghost?: Ghost | null
	/** An edge the dragged song is snapped to, drawn across every lane */
	snapPx?: number | null
	children: React.ReactNode
}) {
	return (
		<div className="flex border-b border-white/5">
			<div
				className={cn(
					"sticky left-0 z-20 flex w-44 shrink-0 flex-col justify-center gap-1.5 border-r border-white/10 bg-zinc-950 px-2.5 sm:w-60",
					LANE_CLASS,
				)}
			>
				{header}
			</div>
			<div
				data-lane-timeline
				className={cn("relative shrink-0 overflow-hidden", LANE_CLASS)}
				style={{ width }}
				onDragOver={event => {
					if (!onDragAt) return
					event.preventDefault()
					onDragAt(event.clientX, event.currentTarget)
				}}
				onDrop={event => {
					if (!onDrop) return
					event.preventDefault()
					onDrop()
				}}
			>
				<div className="absolute inset-y-0 flex items-stretch" style={{ left: offsetPx }}>
					{children}
				</div>
				{ghost && <GhostClip ghost={ghost} />}
				<Playhead />
				<SnapLine snapPx={snapPx} />
			</div>
		</div>
	)
}

/** Where the dragged song would land. */
export function GhostClip({ ghost }: { ghost: Ghost }) {
	return (
		<div
			className="pointer-events-none absolute inset-y-2 z-10 rounded-md border-2 border-dashed border-white/70 bg-white/10"
			style={{ left: ghost.left, width: ghost.width }}
			aria-hidden
		/>
	)
}

/** The edge a dragged song is snapped to. */
export function SnapLine({ snapPx }: { snapPx?: number | null }) {
	if (snapPx === null || snapPx === undefined) return null
	return (
		<div
			className="pointer-events-none absolute inset-y-0 z-20 w-px bg-amber-300"
			style={{ left: snapPx }}
			aria-hidden
		/>
	)
}

export function Playhead() {
	return (
		<div
			className="pointer-events-none absolute inset-y-0 z-10 w-px bg-red-400/90"
			style={{ left: PAST_PX }}
			aria-hidden
		/>
	)
}

/**
 * A fader for a lane, sent to the bot when it is let go rather than on every
 * step. Reaches 200%, stretching to 500% when set higher, like the player's.
 */
export function Fader({
	volume,
	label,
	onRelease,
}: {
	/** Linear: 1 is 100% */
	volume: number
	label: string
	onRelease: (volume: number) => void
}) {
	const [held, setHeld] = useState<number | null>(null)
	const shown = held ?? volume
	const max = volume > 2 ? 500 : 200
	const release = () => {
		if (held === null) return
		setHeld(null)
		if (held !== volume) onRelease(held)
	}
	return (
		<label className="flex items-center gap-2 text-xs text-zinc-400">
			<input
				type="range"
				min={0}
				max={max}
				step={1}
				value={Math.round(shown * 100)}
				aria-label={label}
				onChange={event => setHeld(Number(event.target.value) / 100)}
				onPointerUp={release}
				onKeyUp={release}
				onBlur={release}
				className="h-1 min-w-0 flex-1 cursor-pointer accent-indigo-400"
			/>
			<span className="w-10 shrink-0 text-right tabular-nums">{Math.round(shown * 100)}%</span>
		</label>
	)
}

/** Seconds of silence between a track's songs, sent on Enter or when left. */
export function GapInput({
	gapMs,
	onCommit,
}: {
	gapMs: number
	onCommit: (gapMs: number) => void
}) {
	const [draft, setDraft] = useState<string | null>(null)
	const commit = () => {
		if (draft === null) return
		setDraft(null)
		const seconds = Number(draft)
		if (!Number.isFinite(seconds) || seconds < 0) return
		const ms = Math.round(Math.min(seconds, 600) * 1000)
		if (ms !== gapMs) onCommit(ms)
	}
	return (
		<label className="flex items-center gap-1.5 text-xs text-zinc-400" title="Silence between songs">
			<TimerIcon className="shrink-0" />
			<input
				type="number"
				min={0}
				max={600}
				step={0.5}
				inputMode="decimal"
				value={draft ?? String(gapMs / 1000)}
				onChange={event => setDraft(event.target.value)}
				onBlur={commit}
				onKeyDown={event => {
					if (event.key === "Enter") event.currentTarget.blur()
					if (event.key === "Escape") {
						setDraft(null)
						event.currentTarget.blur()
					}
				}}
				aria-label="Seconds between songs"
				className="h-6 w-14 rounded border border-white/10 bg-white/5 px-1.5 text-right tabular-nums text-zinc-100 outline-none focus:border-indigo-400"
			/>
			<span>s gap</span>
		</label>
	)
}

/** A lane's small square buttons: loop, skip, swap, remove. */
export function LaneButton({
	label,
	onClick,
	active = false,
	danger = false,
	disabled = false,
	busy = false,
	children,
}: {
	label: string
	onClick: () => void
	active?: boolean
	danger?: boolean
	disabled?: boolean
	busy?: boolean
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			title={label}
			aria-label={label}
			aria-pressed={active || undefined}
			disabled={disabled || busy}
			onClick={onClick}
			className={cn(
				"grid h-6 w-6 shrink-0 place-items-center rounded text-zinc-400 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-35",
				active && "bg-indigo-500/30 text-indigo-200",
				danger && "hover:text-red-400",
				busy && "animate-pulse",
			)}
		>
			{children}
		</button>
	)
}
