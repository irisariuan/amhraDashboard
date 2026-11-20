"use client"
import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, type SongReply } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { ScrubBar } from "./scrub-bar"

// The bot's bounds and step for SetSpeed
export const MAX_SPEED = 10
const STEP = 0.01
const PRESETS = [0.5, 0.75, 1, 1.25, 1.5, 2]

/** A speed on the bot's 0.01 step, within its bounds. */
export function stepSpeed(speed: number) {
	if (!Number.isFinite(speed)) return 1
	const stepped = Number((Math.round(speed / STEP) * STEP).toFixed(2))
	return Math.min(MAX_SPEED, Math.max(0, stepped))
}

const times = (speed: number) => `${speed.toFixed(2)}×`

/**
 * Queue 1's playback speed, 0 to 10 on a 0.01 step, pitch kept; 0 holds the
 * song silent. Only the bot's Rust voice path can stretch audio, so elsewhere
 * the controls are shown but disabled.
 */
export function SpeedControls({ data, guildId }: { data: SongReply; guildId: string }) {
	const speed = data.speed ?? 1
	const enabled = data.canSpeed ?? false
	const [typed, setTyped] = useState(speed.toFixed(2))
	// Follows the bot when it changes from elsewhere, as /speed does
	const [shown, setShown] = useState(speed)
	if (shown !== speed) {
		setShown(speed)
		setTyped(speed.toFixed(2))
	}

	async function set(next: number) {
		const value = stepSpeed(next)
		setTyped(value.toFixed(2))
		if (!(await editSong(guildId, SongEditType.SetSpeed, { speed: value }))) {
			toast("Failed to set speed")
		}
		mutate(songKey(guildId))
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className={cn("h-10 px-2 tabular-nums text-xs", enabled && speed !== 1 && "text-indigo-400")}
					title="Speed"
				>
					{times(speed)}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Speed</DialogTitle>
					<DialogDescription>
						{enabled
							? "How fast songs play, without changing their pitch. 0 holds the song silent."
							: "Changing speed needs the bot's Rust voice engine (USE_RUST_VOICE), which is off."}
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 pt-2">
					<ScrubBar
						now={speed}
						totalValue={MAX_SPEED}
						enabled={enabled}
						onRelease={set}
						formatter={v => times(stepSpeed(v))}
					/>
					<form
						className="flex items-center gap-2"
						onSubmit={event => {
							event.preventDefault()
							set(Number.parseFloat(typed))
						}}
					>
						<Input
							type="number"
							min={0}
							max={MAX_SPEED}
							step={STEP}
							value={typed}
							disabled={!enabled}
							onChange={event => setTyped(event.target.value)}
							className="w-28 tabular-nums"
							aria-label="Speed"
						/>
						<Button type="submit" variant="secondary" disabled={!enabled}>
							Set
						</Button>
					</form>
					<div className="flex flex-wrap gap-1">
						{PRESETS.map(preset => (
							<Button
								key={preset}
								variant={preset === speed ? "default" : "ghost"}
								size="sm"
								disabled={!enabled}
								onClick={() => set(preset)}
								className="tabular-nums"
							>
								{preset}×
							</Button>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
