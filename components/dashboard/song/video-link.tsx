"use client"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useVideoDetails } from "@/hooks/use-video-details"
import { VideoDetails } from "./video-details"

/** Link showing the resolved video title, with full details on hover. */
export function VideoLink({ url }: { url: string }) {
	const { isLoading, data } = useVideoDetails(url)
	return (
		<HoverCard>
			<HoverCardTrigger asChild>
				<a
					href={url}
					rel="noreferrer"
					target="_blank"
					className="underline text-indigo-400 hover:text-indigo-300 text-sm truncate block"
				>
					{isLoading ? url : (data?.title ?? url)}
				</a>
			</HoverCardTrigger>
			<HoverCardContent className="w-80">
				<VideoDetails url={url} />
			</HoverCardContent>
		</HoverCard>
	)
}
