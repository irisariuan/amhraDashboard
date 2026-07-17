"use client"
import { Label } from "@/components/ui/label"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useVideoDetails } from "@/hooks/use-video-details"
import type { Session } from "@/lib/session"
import { VideoDetails } from "./video-details"

/** Link showing the resolved video title, with full details on hover. */
export function VideoLink({
	url,
	session,
}: {
	url: string
	session: Session
}) {
	const { isLoading, data } = useVideoDetails(url, session)
	return (
		<HoverCard>
			<HoverCardTrigger>
				<a href={url} rel="noreferrer" target="_blank" className="w-4">
					<Label className="underline text-blue-500 text-base overflow-hidden hover:cursor-pointer text-ellipsis">
						{isLoading ? url : (data?.title ?? url)}
					</Label>
				</a>
			</HoverCardTrigger>
			<HoverCardContent className="w-full">
				<VideoDetails url={url} session={session} />
			</HoverCardContent>
		</HoverCard>
	)
}
