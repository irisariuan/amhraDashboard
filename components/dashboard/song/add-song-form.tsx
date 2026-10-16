"use client"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { editSong, songKey } from "@/lib/api/songs"
import {
	isYoutubePlaylistUrl,
	isYoutubeVideoUrl,
	SongEditType,
	type SearchHit,
	type YoutubePlaylistData,
} from "@/lib/api/types"
import { getPlaylistDetails, searchYoutube, searchYoutubeMany } from "@/lib/api/videos"
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
 * A playlist link is previewed first, then queued whole.
 */
export function AddSongForm({ guildId }: { guildId: string }) {
	const [query, setQuery] = useState("")
	// Results remember the query they answer, so a stale one is never shown
	const [found, setFound] = useState<{ query: string; hits: SearchHit[] } | null>(null)
	const [open, setOpen] = useState(false)
	const [highlighted, setHighlighted] = useState(0)
	const [busy, setBusy] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	const [preview, setPreview] = useState<{
		url: string
		playlist: YoutubePlaylistData | null
	} | null>(null)

	const trimmed = query.trim()
	const isPlaylist = isYoutubePlaylistUrl(query)
	const isUrl = isPlaylist || isYoutubeVideoUrl(query)
	const canSearch = !isUrl && trimmed.length >= MIN_QUERY_LENGTH

	const hits = canSearch && found?.query === trimmed ? found.hits : []
	const searching = canSearch && found?.query !== trimmed
	const playlist = isPlaylist && preview?.url === trimmed ? preview.playlist : null
	const playlistState = !isPlaylist
		? "idle"
		: preview?.url !== trimmed
			? "loading"
			: playlist
				? "idle"
				: "failed"

	// Show what a playlist link holds before committing a few hundred songs
	useEffect(() => {
		if (!isPlaylist) return
		let cancelled = false
		getPlaylistDetails(trimmed).then(result => {
			if (!cancelled) setPreview({ url: trimmed, playlist: result })
		})
		return () => {
			cancelled = true
		}
	}, [trimmed, isPlaylist])

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
	}, [open])

	async function add(url: string, title?: string) {
		setBusy(true)
		setOpen(false)
		try {
			if (await editSong(guildId, SongEditType.AddSong, { url })) {
				mutate(songKey(guildId))
				setQuery("")
				setFound(null)
				toast(title ? `Added "${title}" to queue` : "Added to queue")
			} else {
				toast("Failed to add to queue")
			}
		} finally {
			setBusy(false)
		}
	}

	async function addPlaylist(next: boolean) {
		const url = query.trim()
		setBusy(true)
		try {
			if (await editSong(guildId, SongEditType.AddPlaylist, { url, next })) {
				mutate(songKey(guildId))
				setQuery("")
				toast(
					playlist
						? `Added ${playlist.videos.length} songs from "${playlist.title}"${next ? " to play next" : ""}`
						: "Added playlist to queue",
				)
			} else {
				toast("Failed to add playlist")
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
		if (isPlaylist) return addPlaylist(false)
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
					placeholder="Paste a YouTube video or playlist link, or search…"
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

			{isPlaylist && (
				<div className="mt-2 flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
					<span className="min-w-0 flex-1 truncate text-zinc-300">
						{playlistState === "loading" && "Reading playlist…"}
						{playlistState === "failed" && "Couldn't read this playlist"}
						{playlist &&
							`${playlist.title} · ${playlist.videos.length} song${playlist.videos.length === 1 ? "" : "s"}`}
					</span>
					<Button
						type="button"
						size="sm"
						variant="secondary"
						disabled={busy || !playlist?.videos.length}
						onClick={() => addPlaylist(true)}
					>
						Play next
					</Button>
					<Button
						type="button"
						size="sm"
						disabled={busy || !playlist?.videos.length}
						onClick={() => addPlaylist(false)}
					>
						Add all
					</Button>
				</div>
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
