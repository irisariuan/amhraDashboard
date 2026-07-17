"use client"
import { usePlayer } from "@/hooks/use-player"
import { NowPlaying } from "./now-playing"
import { Panels } from "./panels"
import { PlayerPlaceholder } from "./placeholder"

/**
 * The player view for one guild: now-playing hero on the left, queue/history/
 * suggestions panels on the right. The persistent playback bar is rendered by
 * the shell so it stays fixed to the bottom.
 */
export function SongDashboard({ guildId }: { guildId: string }) {
	const { data, isLoading } = usePlayer(guildId)

	if (!data || isLoading) {
		return <PlayerPlaceholder showWaitedMessage={false} />
	}

	return (
		<div className="grid lg:grid-cols-2 gap-8 h-full">
			<div className="flex items-center justify-center">
				<NowPlaying data={data} guildId={guildId} />
			</div>
			<div className="min-h-0">
				<Panels data={data} guildId={guildId} />
			</div>
		</div>
	)
}
