"use client"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, YoutubeVideoRegex, type SearchHit } from "@/lib/api/types"
import { searchYoutube, searchYoutubeMany } from "@/lib/api/videos"
import { formatDuration } from "@/lib/format"

/** Quiet period after the last keystroke before a search is sent */
const DEBOUNCE_MS = 300
/** Below this, a query matches too much to be worth a request */
const MIN_QUERY_LENGTH = 2

/**
 * Adds a song by URL or free-text search.
 *
 * Typing runs a debounced search and offers the matches directly, so the right
 * song can be picked rather than trusting whatever the top hit happens to be.
 * Submitting without choosing keeps the old behavior of taking the best match.
 */
export function AddSongForm({ guildId }: { guildId: string }) {
	const [query, setQuery] = useState("")
	const [hits, setHits] = useState<SearchHit[]>([])
	const [open, setOpen] = useState(false)
	const [highlighted, setHighlighted] = useState(0)
	const [busy, setBusy] = useState(false)
	const [searching, setSearching] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	const isUrl = YoutubeVideoRegex.test(query)
	const canSearch = !isUrl && query.trim().length >= MIN_QUERY_LENGTH

	useEffect(() => {
		if (!canSearch) {
			setHits([])
			setSearching(false)
			return
		}
		// Cancels both the timer and any request it already started, so only the
		// query the user actually stopped on is waited on
		const controller = new AbortController()
		setSearching(true)
		const timer = setTimeout(async () => {
			const results = await searchYoutubeMany(query.trim(), 5, controller.signal)
			if (controller.signal.aborted) return
			setHits(results)
			setHighlighted(0)
			setOpen(results.length > 0)
			setSearching(false)
		}, DEBOUNCE_MS)

		return () => {
			clearTimeout(timer)
			controller.abort()
		}
	}, [query, canSearch])

	// Clicking anywhere else should put the dropdown away
	useEffect(() => {
		if (!open) return
		function onPointerDown(event: MouseEvent) {
			if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", onPointerDown)
		return () => document.removeEventListener("mousedown", onPointerDown)
	}, [open])

	async function add(url: string, title?: string) {
		setBusy(true)
		setOpen(false)
		try {
			if (await editSong(guildId, SongEditType.AddSong, { url })) {
				mutate(songKey(guildId))
				setQuery("")
				setHits([])
				toast(title ? `Added "${title}" to queue` : "Added to queue")
			} else {
				toast("Failed to add to queue")
			}
		} finally {
			setBusy(false)
		}
	}

	/** Submitting without picking: a URL goes straight in, anything else resolves to the best match */
	async function submit(event: React.FormEvent) {
		event.preventDefault()
		const value = query.trim()
		if (!value || busy) return
		if (isUrl) return add(value)

		// A loaded dropdown already holds the answer, so do not search again
		if (hits.length) return add(hits[highlighted]?.url ?? hits[0].url, hits[highlighted]?.title)

		setBusy(true)
		try {
			const result = await searchYoutube(value)
			await add(result.url, result.title)
		} catch {
			toast("Search failed")
		} finally {
			setBusy(false)
		}
	}

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

	return (
		<div ref={containerRef} className="relative w-full">
			<form onSubmit={submit} className="flex w-full items-center gap-2">
				<Input
					placeholder="Paste a YouTube URL or search…"
					className="flex-1 bg-white/5 border-white/10"
					disabled={busy}
					value={query}
					onChange={event => setQuery(event.target.value)}
					onFocus={() => hits.length && setOpen(true)}
					onKeyDown={onKeyDown}
					autoComplete="off"
					aria-expanded={open}
					aria-autocomplete="list"
					role="combobox"
				/>
				<Button type="submit" disabled={busy} size="icon">
					<PlusCircledIcon />
				</Button>
			</form>

			{searching && !open && (
				<p className="mt-1 text-xs text-zinc-500">Searching…</p>
			)}

			{open && hits.length > 0 && (
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
								onClick={() => add(hit.url, hit.title)}
								disabled={busy}
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
									<span className="block truncate text-sm text-zinc-100">
										{hit.title}
									</span>
									<span className="block truncate text-xs text-zinc-500">
										{hit.channel ? `${hit.channel} · ` : ""}
										{formatDuration(hit.durationInSec)}
									</span>
								</span>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
