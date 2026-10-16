"use client"
import { MagnifyingGlassIcon, ResetIcon } from "@radix-ui/react-icons"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/shared/spinner"
import { useLyrics } from "@/hooks/use-lyrics"
import { usePlaybackTime } from "@/hooks/use-player"
import { editSong, songKey } from "@/lib/api/songs"
import { type LyricLine, SongEditType, type SongReply } from "@/lib/api/types"
import { cn } from "@/lib/utils"

/** After a manual scroll, leave the user in charge for this long */
const MANUAL_SCROLL_HOLD_MS = 4000

/** Index of the line showing at `ms`, or -1 before the first one. */
function lineIndexAt(lines: LyricLine[], ms: number) {
	let lo = 0
	let hi = lines.length - 1
	let found = -1
	while (lo <= hi) {
		const mid = (lo + hi) >> 1
		if (lines[mid].time <= ms) {
			found = mid
			lo = mid + 1
		} else hi = mid - 1
	}
	return found
}

/**
 * Lyrics for the playing track, from LRCLIB via the bot.
 *
 * Synced lyrics follow playback, scrolling the current line into view and
 * seeking when a line is clicked; plain lyrics are shown as text. The match is
 * guessed from the YouTube title, so a search box can replace it.
 */
export function Lyrics({ data, guildId }: { data: SongReply; guildId: string }) {
	const link = data.song?.link ?? null
	// A search belongs to the track it was typed for; a new song drops it
	const [search, setSearch] = useState<{ query: string; link: string | null } | null>(null)
	const query = search && search.link === link ? search.query : null
	const [draft, setDraft] = useState("")

	const { data: reply, error, isLoading } = useLyrics(guildId, link, query)
	// Without a search, an answer for another track is stale
	const lyrics = reply && (query || reply.link === link) ? reply.content : null

	function submit(event: React.FormEvent) {
		event.preventDefault()
		const value = draft.trim()
		if (value) setSearch({ query: value, link })
	}

	const searchForm = (
		<form onSubmit={submit} className="flex items-center gap-2 px-2">
			<Input
				value={draft}
				onChange={event => setDraft(event.target.value)}
				placeholder="Wrong lyrics? Search by song name…"
				className="h-8 flex-1 bg-white/5 border-white/10 text-sm"
			/>
			<Button type="submit" size="icon" variant="ghost" className="h-8 w-8" title="Search lyrics">
				<MagnifyingGlassIcon />
			</Button>
			{query && (
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="h-8 w-8"
					title="Back to the automatic match"
					onClick={() => {
						setSearch(null)
						setDraft("")
					}}
				>
					<ResetIcon />
				</Button>
			)}
		</form>
	)

	if (!link && !query) {
		return <Empty>Play something to see its lyrics.</Empty>
	}
	if (isLoading || (!error && !reply)) {
		return (
			<div className="grid place-items-center py-8">
				<Spinner />
			</div>
		)
	}

	let body: React.ReactNode
	if (error) {
		body = <Empty>The lyrics service is unavailable right now.</Empty>
	} else if (!lyrics) {
		body = <Empty>No lyrics found{query ? ` for “${query}”` : " for this song"}.</Empty>
	} else if (!lyrics.synced && !lyrics.plain) {
		body = <Empty>{lyrics.instrumental ? "This track is instrumental." : "No lyrics found."}</Empty>
	} else {
		// A search is nearly always for the playing song, so it follows too
		const canFollow = Boolean(lyrics.synced && data.song)
		body = (
			<>
				<div className="flex items-baseline justify-between gap-2 px-2">
					<div className="min-w-0">
						<p className="truncate text-sm font-medium">{lyrics.trackName}</p>
						<p className="truncate text-xs text-zinc-500">
							{lyrics.artistName}
							{lyrics.albumName ? ` · ${lyrics.albumName}` : ""}
						</p>
					</div>
					<span className="flex-none text-[10px] uppercase tracking-wide text-zinc-500">
						{canFollow ? "Synced" : "Plain"} · LRCLIB
					</span>
				</div>
				{canFollow && lyrics.synced ? (
					<SyncedLyrics lines={lyrics.synced} data={data} guildId={guildId} />
				) : (
					<p className="whitespace-pre-line px-2 text-sm leading-7 text-zinc-300">
						{lyrics.plain ?? lyrics.synced?.map(line => line.text).join("\n")}
					</p>
				)}
			</>
		)
	}

	return (
		<div className="flex flex-col gap-3 pb-4">
			{searchForm}
			{body}
		</div>
	)
}

function SyncedLyrics({
	lines,
	data,
	guildId,
}: {
	lines: LyricLine[]
	data: SongReply
	guildId: string
}) {
	const time = usePlaybackTime(data)
	const current = lineIndexAt(lines, time * 1000)
	const containerRef = useRef<HTMLDivElement>(null)
	const manualUntil = useRef(0)

	// Scroll the panel's own viewport, not the page: scrollIntoView would move
	// every scrollable ancestor, including the window on a phone
	useEffect(() => {
		if (Date.now() < manualUntil.current) return
		const container = containerRef.current
		const viewport = container?.closest<HTMLElement>("[data-radix-scroll-area-viewport]")
		const line = container?.querySelector<HTMLElement>(`[data-line="${Math.max(current, 0)}"]`)
		if (!viewport || !line) return
		const lineTop = line.getBoundingClientRect().top - viewport.getBoundingClientRect().top
		viewport.scrollTo({
			top: viewport.scrollTop + lineTop - viewport.clientHeight / 3,
			behavior: "smooth",
		})
	}, [current])

	function holdScroll() {
		manualUntil.current = Date.now() + MANUAL_SCROLL_HOLD_MS
	}

	const canSeek = data.canSeek
	const seek = useCallback(
		async (line: LyricLine) => {
			if (!canSeek) return
			if (!(await editSong(guildId, SongEditType.SetTime, { sec: Math.floor(line.time / 1000) }))) {
				toast("Failed to seek")
			}
			manualUntil.current = 0
			mutate(songKey(guildId))
		},
		[canSeek, guildId],
	)

	return (
		<div
			ref={containerRef}
			onWheel={holdScroll}
			onTouchMove={holdScroll}
			className="flex flex-col px-1"
		>
			{lines.map((line, index) => (
				<Line
					key={`${index}-${line.time}`}
					index={index}
					line={line}
					state={index === current ? "current" : index < current ? "past" : "future"}
					seekable={data.canSeek}
					onSeek={seek}
				/>
			))}
		</div>
	)
}

// Memoised so the 100 ms playback tick only re-renders the lines whose state moved
const Line = memo(function Line({
	index,
	line,
	state,
	seekable,
	onSeek,
}: {
	index: number
	line: LyricLine
	state: "past" | "current" | "future"
	seekable: boolean
	onSeek: (line: LyricLine) => void
}) {
	const className = useMemo(
		() =>
			cn(
				"rounded-md px-2 py-1 text-left leading-snug transition-[color,font-size] duration-300",
				state === "current" && "text-base font-semibold text-indigo-200",
				state === "past" && "text-sm text-zinc-500",
				state === "future" && "text-sm text-zinc-300",
				seekable && "hover:bg-white/5 active:bg-white/5",
			),
		[state, seekable],
	)
	return (
		<button
			type="button"
			data-line={index}
			disabled={!seekable}
			onClick={() => onSeek(line)}
			className={cn(className, "disabled:cursor-default")}
			aria-current={state === "current" ? "true" : undefined}
		>
			{line.text || "♪"}
		</button>
	)
})

function Empty({ children }: { children: React.ReactNode }) {
	return <p className="text-zinc-500 italic text-sm px-2 py-6 text-center">{children}</p>
}
