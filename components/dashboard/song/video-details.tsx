"use client"
import { EyeOpenIcon } from "@radix-ui/react-icons"
import { ClockIcon } from "lucide-react"
import { Spinner } from "@/components/shared/spinner"
import { useVideoDetails } from "@/hooks/use-video-details"
import { formatDuration } from "@/lib/format"
import type { Session } from "@/lib/session"

/** Title, channel, duration, and view count for a YouTube URL. */
export function VideoDetails({
	url,
	session,
}: {
	url: string
	session: Session
}) {
	const { data, isLoading, error } = useVideoDetails(url, session)

	if (isLoading || !data || error) {
		return (
			<div className="w-min h-min overflow-hidden">
				<Spinner />
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-2">
			<a href={url} rel="noreferrer" target="_blank">
				{data.title}
			</a>
			<a
				href={data.channel?.url}
				rel="noreferrer"
				target="_blank"
				className="text-zinc-500 underline"
			>
				{data.channel?.name}
			</a>
			<div className="flex gap-2">
				<div className="flex bg-blue-500 rounded-lg px-2 items-center gap-2 text-blue-300">
					<ClockIcon className="w-4" />
					<p className="text-white">
						{formatDuration(data.durationInSec ?? 0)}
					</p>
				</div>
				<div className="flex items-center gap-2 bg-zinc-200 px-2 rounded-lg text-zinc-500">
					<EyeOpenIcon />
					<span>{data.views}</span>
				</div>
			</div>
		</div>
	)
}
