"use client"
import { EyeOpenIcon } from "@radix-ui/react-icons"
import { ClockIcon } from "lucide-react"
import { Spinner } from "@/components/shared/spinner"
import { useVideoDetails } from "@/hooks/use-video-details"
import { formatDuration } from "@/lib/format"

/** Title, channel, duration, and view count for a YouTube URL. */
export function VideoDetails({ url }: { url: string }) {
	const { data, isLoading, error } = useVideoDetails(url)

	if (isLoading || !data || error) {
		return (
			<div className="w-min h-min overflow-hidden">
				<Spinner />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-2">
			<a href={url} rel="noreferrer" target="_blank" className="font-medium">
				{data.title}
			</a>
			<a
				href={data.channel?.url}
				rel="noreferrer"
				target="_blank"
				className="text-zinc-500 underline text-sm"
			>
				{data.channel?.name}
			</a>
			<div className="flex gap-2">
				<div className="flex bg-indigo-500/20 text-indigo-200 rounded-lg px-2 py-0.5 items-center gap-1.5 text-sm">
					<ClockIcon className="w-3.5" />
					{formatDuration(data.durationInSec ?? 0)}
				</div>
				<div className="flex items-center gap-1.5 bg-zinc-500/15 px-2 py-0.5 rounded-lg text-zinc-400 text-sm">
					<EyeOpenIcon />
					<span>{Intl.NumberFormat().format(data.views)}</span>
				</div>
			</div>
		</div>
	)
}
