"use client"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addSong, editSong, songKey } from "@/lib/api/songs"
import {
	isYoutubePlaylistUrl,
	isYoutubeVideoUrl,
	SongEditType,
	type YoutubePlaylistData,
} from "@/lib/api/types"
import { getPlaylistDetails, searchYoutube } from "@/lib/api/videos"
import { SearchResults, useYoutubeSearch } from "./search-results"

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
	const [busy, setBusy] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	const [preview, setPreview] = useState<{
		url: string
		playlist: YoutubePlaylistData | null
	} | null>(null)

	const trimmed = query.trim()
	const isPlaylist = isYoutubePlaylistUrl(query)
	const isUrl = isPlaylist || isYoutubeVideoUrl(query)
	const search = useYoutubeSearch(query, containerRef, !isUrl)
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

	async function add(url: string, title?: string) {
		setBusy(true)
		search.setOpen(false)
		try {
			const result = await addSong(guildId, url)
			if (result === "failed") {
				toast("Failed to add to queue")
				return
			}
			mutate(songKey(guildId))
			setQuery("")
			search.clear()
			if (result === "scheduled") {
				// Premieres cannot play until they start, so the bot schedules them
				toast("That's an upcoming premiere — it will cut in when it starts (see Scheduled)")
			} else {
				toast(title ? `Added "${title}" to queue` : "Added to queue")
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
		if (search.chosen) return add(search.chosen.url, search.chosen.title)

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

	return (
		<div ref={containerRef} className="relative w-full">
			<form onSubmit={submit} className="flex w-full items-center gap-2">
				<Input
					placeholder="Paste a YouTube video or playlist link, or search…"
					className="flex-1 bg-white/5 border-white/10"
					disabled={busy}
					value={query}
					onChange={event => setQuery(event.target.value)}
					onFocus={() => search.hits.length && search.setOpen(true)}
					onKeyDown={search.onKeyDown}
					autoComplete="off"
					aria-expanded={search.open}
					aria-autocomplete="list"
					role="combobox"
				/>
				<Button type="submit" disabled={busy} size="icon">
					<PlusCircledIcon />
				</Button>
			</form>

			{search.searching && !search.open && (
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

			<SearchResults search={search} disabled={busy} onPick={hit => add(hit.url, hit.title)} />
		</div>
	)
}
