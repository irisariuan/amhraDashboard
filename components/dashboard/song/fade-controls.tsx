"use client"
import { MixerHorizontalIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, type SongReply } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { ScrubBar } from "./scrub-bar"

// The bot's bounds for SetCrossfade
const MAX_CROSSFADE_MS = 15_000
const MAX_SKIP_FADE_MS = 5_000

const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`

/**
 * Per-guild crossfade and skip fade. Only the bot's Rust voice path can mix
 * two tracks, so elsewhere the controls are shown but disabled rather than
 * accepting a value that would be silently ignored.
 */
export function FadeControls({ data, guildId }: { data: SongReply; guildId: string }) {
	async function set(detail: { crossfadeMs?: number; skipFadeMs?: number }) {
		if (!(await editSong(guildId, SongEditType.SetCrossfade, detail))) {
			toast("Failed to set fade")
		}
		mutate(songKey(guildId))
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(data.canCrossfade && data.crossfadeMs > 0 && "text-indigo-400")}
					title="Crossfade"
				>
					<MixerHorizontalIcon />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Crossfade</DialogTitle>
					<DialogDescription>
						{data.canCrossfade
							? "How long one track blends into the next. Applies to this server only."
							: "Crossfading needs the bot's Rust voice engine (USE_RUST_VOICE), which is off."}
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 pt-2">
					<label className="flex flex-col gap-1 text-sm">
						<span className="flex justify-between">
							Between tracks
							<span className="tabular-nums text-zinc-400">{seconds(data.crossfadeMs)}</span>
						</span>
						<ScrubBar
							now={data.crossfadeMs}
							totalValue={MAX_CROSSFADE_MS}
							enabled={data.canCrossfade}
							onRelease={v => set({ crossfadeMs: Math.round(v / 100) * 100 })}
							formatter={seconds}
						/>
					</label>
					<label className="flex flex-col gap-1 text-sm">
						<span className="flex justify-between">
							When skipping
							<span className="tabular-nums text-zinc-400">{seconds(data.skipFadeMs)}</span>
						</span>
						<ScrubBar
							now={data.skipFadeMs}
							totalValue={MAX_SKIP_FADE_MS}
							enabled={data.canCrossfade}
							onRelease={v => set({ skipFadeMs: Math.round(v / 100) * 100 })}
							formatter={seconds}
						/>
					</label>
				</div>
			</DialogContent>
		</Dialog>
	)
}
