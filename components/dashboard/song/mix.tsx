"use client"
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addLayer, editSong, songKey, type AddLayerError } from "@/lib/api/songs"
import {
	isYoutubeVideoUrl,
	MAX_MIX_LAYERS,
	SongEditType,
	type MixLayer,
	type SongReply,
} from "@/lib/api/types"
import { searchYoutube } from "@/lib/api/videos"
import { ScrubBar } from "./scrub-bar"

const ERROR_TEXT: Record<AddLayerError, string> = {
	not_native: "Mixing needs the bot's Rust voice engine (USE_RUST_VOICE), which is off",
	not_connected: "The bot needs to be in a voice channel to mix",
	full: `The mix is full — remove a song first (up to ${MAX_MIX_LAYERS})`,
	not_found: "Couldn't find that video",
	failed: "Couldn't download that video",
}

const percent = (volume: number) => `${(volume * 100).toFixed(0)}%`

/** Same reach as the player's volume bar: 200%, stretching to 500% when set higher. */
const rangeFor = (volume: number) => Math.min(Math.max(2, volume), 5)

/** Volumes go to the bot as whole percents, which is what Discord's /mix shows. */
const rounded = (volume: number) => Math.round(volume * 100) / 100

/**
 * Songs played on top of the queue, each at its own volume.
 *
 * The queue keeps playing as normal; a mixed-in song plays once alongside it
 * and drops out of the list when it ends. The player's own volume bar is the
 * master over everything here.
 */
export function Mix({ data, guildId }: { data: SongReply; guildId: string }) {
	const [input, setInput] = useState("")
	const [busy, setBusy] = useState(false)
	const mix = data.mix ?? { mainVolume: 1, layers: [] }
	const full = mix.layers.length >= MAX_MIX_LAYERS

	if (!data.canMix) {
		return (
			<p className="text-zinc-500 italic text-sm px-2 py-6 text-center">
				{ERROR_TEXT.not_native}
			</p>
		)
	}

	async function submit(event: React.FormEvent) {
		event.preventDefault()
		const query = input.trim()
		if (!query || busy || full) return
		setBusy(true)
		try {
			let url = query
			if (!isYoutubeVideoUrl(query)) {
				const found = await searchYoutube(query).catch(() => null)
				if (!found?.url) {
					toast(ERROR_TEXT.not_found)
					return
				}
				url = found.url
			}
			const result = await addLayer(guildId, url)
			if ("error" in result) {
				toast(ERROR_TEXT[result.error])
				return
			}
			setInput("")
			mutate(songKey(guildId))
		} finally {
			setBusy(false)
		}
	}

	async function setMainVolume(volume: number) {
		if (!(await editSong(guildId, SongEditType.SetMainVolume, { volume: rounded(volume) }))) {
			toast("Failed to set volume")
		}
		mutate(songKey(guildId))
	}

	async function setLayerVolume(layer: MixLayer, volume: number) {
		if (
			!(await editSong(guildId, SongEditType.SetLayerVolume, {
				id: layer.id,
				volume: rounded(volume),
			}))
		) {
			// Most likely it ended while the slider was held
			toast(`"${layer.title}" is no longer playing`)
		}
		mutate(songKey(guildId))
	}

	async function remove(layer: MixLayer) {
		if (!(await editSong(guildId, SongEditType.RemoveLayer, { id: layer.id }))) {
			toast(`"${layer.title}" is no longer playing`)
		}
		mutate(songKey(guildId))
	}

	return (
		<div className="flex flex-col gap-3">
			<form
				onSubmit={submit}
				className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3"
			>
				<div className="flex items-center gap-2">
					<Input
						placeholder="YouTube link or search"
						className="min-w-0 flex-1 bg-white/5 border-white/10"
						value={input}
						onChange={event => setInput(event.target.value)}
						disabled={busy || full}
						autoComplete="off"
					/>
					<Button type="submit" disabled={busy || full || !input.trim()}>
						<PlusIcon className="mr-1.5" />
						{busy ? "Mixing…" : "Mix in"}
					</Button>
				</div>
				<p className="text-xs text-zinc-500">
					{full
						? ERROR_TEXT.full
						: "Plays once on top of the queue, at its own volume. The player's volume bar sets the level of everything together."}
				</p>
			</form>

			<div className="flex flex-col gap-1">
				<VolumeRow
					title="Queue"
					subtitle={data.song?.title ?? "Nothing in the queue is playing"}
					volume={mix.mainVolume}
					onRelease={setMainVolume}
				/>
				{mix.layers.map(layer => (
					<VolumeRow
						key={layer.id}
						title={layer.title}
						href={layer.url}
						volume={layer.volume}
						onRelease={volume => setLayerVolume(layer, volume)}
						onRemove={() => remove(layer)}
					/>
				))}
				{mix.layers.length === 0 && (
					<p className="text-zinc-500 italic text-sm px-2 py-6 text-center">
						Nothing is mixed in
					</p>
				)}
			</div>
		</div>
	)
}

function VolumeRow({
	title,
	subtitle,
	href,
	volume,
	onRelease,
	onRemove,
}: {
	title: string
	subtitle?: string
	href?: string
	volume: number
	onRelease: (volume: number) => void
	onRemove?: () => void
}) {
	return (
		<div className="group flex min-w-0 items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5 active:bg-white/5">
			<div className="flex min-w-0 flex-1 flex-col gap-1 overflow-hidden">
				<span className="flex min-w-0 items-baseline justify-between gap-2">
					{href ? (
						<a
							href={href}
							target="_blank"
							rel="noreferrer"
							className="truncate text-sm hover:text-indigo-300 active:text-indigo-300"
						>
							{title}
						</a>
					) : (
						<span className="truncate text-sm font-medium">{title}</span>
					)}
					<span className="flex-none tabular-nums text-xs text-zinc-400">{percent(volume)}</span>
				</span>
				{subtitle && <span className="truncate text-xs text-zinc-500">{subtitle}</span>}
				<ScrubBar
					now={volume}
					totalValue={rangeFor(volume)}
					enabled
					onRelease={onRelease}
					formatter={percent}
				/>
			</div>
			{onRemove ? (
				<Button
					variant="ghost"
					size="icon"
					title="Remove"
					aria-label={`Remove ${title}`}
					className="text-zinc-400 hover:text-red-400 active:bg-accent active:text-red-400"
					onClick={onRemove}
				>
					<Cross2Icon />
				</Button>
			) : (
				// Keeps the queue's bar the same width as the layers' bars
				<span className="w-10 flex-none" aria-hidden />
			)}
		</div>
	)
}
