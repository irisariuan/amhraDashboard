import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Channel } from "@/lib/api/log"
import { getMessages } from "@/lib/api/web"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import useSWR from "swr"
import moment from "moment"

export default function MessageComponent({
	guildId,
	auth,
}: {
	guildId: string
	auth: string
}) {
	const {
		data: channels,
		isLoading,
	}: {
		data: Channel[] | undefined
		isLoading: boolean
	} = useSWR("/api/messages/" + guildId, () => {
		return getMessages(auth, guildId)
	})

	return (
		<>
			{isLoading ? (
				<Skeleton />
			) : (
				channels?.map((v, i) => {
					return (
						<div key={i} className="flex flex-col my-2">
							<div className="flex">
								<HoverCard>
									<HoverCardTrigger className="">
										<p>{v.channel.name}</p>
									</HoverCardTrigger>
									<HoverCardContent className="w-auto">
										<div className="flex gap-2">
											<Badge>Channel ID</Badge>
											<p>{v.channel.id}</p>
										</div>
									</HoverCardContent>
								</HoverCard>
							</div>
							<div className="">
								{v.messages.length > 0 ? (
									<ScrollArea className="h-64 p-4 bg-slate-100 rounded-xl">
										<ul className="gap-4 flex flex-col">
											{v.messages.map((v, i) => {
												return (
													<>
														<li key={i} className="flex gap-2">
															<HoverCard>
																<HoverCardTrigger>
																	<p className="p-1 px-2 bg-slate-300 rounded text-slate-700 w-max">
																		{v.author.tag}
																	</p>
																</HoverCardTrigger>
																<HoverCardContent className="flex justify-center w-auto gap-2 flex-col">
																	<div className="flex gap-2">
																		<Badge>User ID</Badge>
																		<p>{v.author.id}</p>
																	</div>
																	<div className="flex gap-2">
																		<Badge>Created Time</Badge>
																		<p>
																			{moment(v.timestamp.createdAt).format(
																				"DD/MM/YYYY hh:mm:ss"
																			)}
																		</p>
																	</div>
																	{v.timestamp.editedAt && (
																		<div className="flex gap-2">
																			<Badge>Edited Time</Badge>
																			<p>
																				{moment(v.timestamp.editedAt).format(
																					"DD/MM/YYYY hh:mm:ss"
																				)}
																			</p>
																		</div>
																	)}
																</HoverCardContent>
															</HoverCard>
															<p className="overflow-auto">
																{v.message.content}
															</p>
														</li>
														<Separator />
													</>
												)
											})}
										</ul>
									</ScrollArea>
								) : (
									<p className="p-4 bg-slate-100 rounded-xl text-slate-500 italic">
										No message found
									</p>
								)}
							</div>
						</div>
					)
				})
			)}
		</>
	)
}
