"use client"
import { useEffect, useState, type RefObject } from "react"
import type { SearchHit } from "@/lib/api/types"
import { searchYoutubeMany } from "@/lib/api/videos"
import { formatDuration } from "@/lib/format"

/** Quiet period after the last keystroke before a search is sent */
const DEBOUNCE_MS = 300
/** Below this, a query matches too much to be worth a request */
const MIN_QUERY_LENGTH = 2

/**
 * A debounced live YouTube search for an input, with the dropdown's open and
 * highlighted state. Clicks outside `containerRef` close the dropdown.
 * `enabled` false (say, the input holds a link) searches nothing and shows no
 * matches.
 */
export function useYoutubeSearch(
	query: string,
	containerRef: RefObject<HTMLElement | null>,
	enabled = true,
) {
	// Results remember the query they answer, so a stale one is never shown
	const [found, setFound] = useState<{ query: string; hits: SearchHit[] } | null>(null)
	const [open, setOpen] = useState(false)
	const [highlighted, setHighlighted] = useState(0)

	const trimmed = query.trim()
	const canSearch = enabled && trimmed.length >= MIN_QUERY_LENGTH
	const hits = canSearch && found?.query === trimmed ? found.hits : []
	const searching = canSearch && found?.query !== trimmed

	useEffect(() => {
		if (!canSearch) return
		// Cancels both the timer and any request it already started, so only the
		// query the user actually stopped on is waited on
		const controller = new AbortController()
		const timer = setTimeout(async () => {
			const results = await searchYoutubeMany(trimmed, 5, controller.signal)
			if (controller.signal.aborted) return
			setFound({ query: trimmed, hits: results })
			setHighlighted(0)
			setOpen(results.length > 0)
		}, DEBOUNCE_MS)

		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [trimmed, canSearch])

	// Clicking anywhere else should put the dropdown away
	useEffect(() => {
		if (!open) return
		function onPointerDown(event: MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", onPointerDown)
		return () => document.removeEventListener("mousedown", onPointerDown)
	}, [open, containerRef])

	function onKeyDown(event: React.KeyboardEvent) {
		if (!open || !hits.length) return
		if (event.key === "ArrowDown") {
			event.preventDefault()
			setHighlighted(i => (i + 1) % hits.length)
		} else if (event.key === "ArrowUp") {
			event.preventDefault()
			setHighlighted(i => (i - 1 + hits.length) % hits.length)
		} else if (event.key === "Escape") {
			setOpen(false)
		}
	}

	return {
		hits,
		searching,
		open: open && hits.length > 0,
		/** The match Enter should take: the highlighted one, else the top one */
		chosen: hits[highlighted] ?? hits[0],
		highlighted,
		setHighlighted,
		setOpen,
		onKeyDown,
		/** Forget the matches, after one was added */
		clear: () => setFound(null),
	}
}

/** The live search dropdown under an input; place it inside `containerRef`. */
export function SearchResults({
	search: { open, hits, highlighted, setHighlighted },
	disabled,
	onPick,
}: {
	search: ReturnType<typeof useYoutubeSearch>
	disabled?: boolean
	onPick: (hit: SearchHit) => void
}) {
	if (!open) return null
	return (
		<ul
			role="listbox"
			className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-xl backdrop-blur"
		>
			{hits.map((hit, index) => (
				<li key={hit.url} role="option" aria-selected={index === highlighted}>
					<button
						type="button"
						className={`flex w-full min-w-0 items-center gap-3 px-3 py-2 text-left transition-colors ${
							index === highlighted ? "bg-white/10" : "hover:bg-white/5"
						}`}
						onMouseEnter={() => setHighlighted(index)}
						onClick={() => onPick(hit)}
						disabled={disabled}
					>
						{hit.thumbnail && (
							// Remote YouTube thumbnails, so not next/image
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={hit.thumbnail}
								alt=""
								className="h-9 w-16 flex-none rounded object-cover"
								loading="lazy"
							/>
						)}
						<span className="min-w-0 flex-1 overflow-hidden">
							<span className="block truncate text-sm text-zinc-100">{hit.title}</span>
							<span className="block truncate text-xs text-zinc-500">
								{hit.channel ? `${hit.channel} · ` : ""}
								{formatDuration(hit.durationInSec)}
							</span>
						</span>
					</button>
				</li>
			))}
		</ul>
	)
}
