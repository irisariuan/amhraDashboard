"use client"
import { Badge } from "@/components/ui/badge"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useMessages } from "@/hooks/use-guilds"
import { formatDateTime } from "@/lib/format"
import type { Session } from "@/lib/session"

/** Recent messages per channel, with author/timestamp hover cards. */
export function MessageList({
	session,
	guildId,
}: {
	session: Session
	guildId: string
}) {
	const { data: channels, isLoading } = useMessages(session, guildId)

	if (isLoading) {
		return <Skeleton className="h-10 w-10" />
	}

	return (
		<>
			{channels?.map(channel => (
				<div key={channel.channel.id} className="flex flex-col my-2">
					<div className="flex">
						<HoverCard>
							<HoverCardTrigger>
								<p>{channel.channel.name}</p>
							</HoverCardTrigger>
							<HoverCardContent className="w-auto">
								<div className="flex gap-2">
									<Badge>Channel ID</Badge>
									<p>{channel.channel.id}</p>
								</div>
							</HoverCardContent>
						</HoverCard>
					</div>
					<div>
						{channel.messages.length > 0 ? (
							<ScrollArea className="h-64 px-2 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
								<ul className="gap-4 flex flex-col">
									{channel.messages.map(entry => (
										<div key={entry.message.id}>
											<li className="flex gap-2">
												<HoverCard>
													<HoverCardTrigger>
														<p className="p-1 px-2 bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 rounded text-zinc-700 w-max">
															{entry.author.tag}
														</p>
													</HoverCardTrigger>
													<HoverCardContent className="flex justify-center w-auto gap-2 flex-col">
														<div className="flex gap-2">
															<Badge>
																User ID
															</Badge>
															<p>
																{
																	entry.author
																		.id
																}
															</p>
														</div>
														<div className="flex gap-2">
															<Badge>
																Created Time
															</Badge>
															<p>
																{formatDateTime(
																	entry
																		.timestamp
																		.createdAt,
																)}
															</p>
														</div>
														{entry.timestamp
															.editedAt && (
															<div className="flex gap-2">
																<Badge>
																	Edited Time
																</Badge>
																<p>
																	{formatDateTime(
																		entry
																			.timestamp
																			.editedAt,
																	)}
																</p>
															</div>
														)}
													</HoverCardContent>
												</HoverCard>
												<p className="overflow-auto">
													{entry.message.content}
												</p>
											</li>
											<Separator />
										</div>
									))}
								</ul>
							</ScrollArea>
						) : (
							<p className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-500 italic">
								No message found
							</p>
						)}
					</div>
				</div>
			))}
		</>
	)
}
