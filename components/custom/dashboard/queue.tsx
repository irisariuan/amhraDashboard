import { Reorder } from "framer-motion"
import { SongEditType } from "@/lib/api/song"
import { editAction } from "@/lib/api/web"
import { useEffect, useState } from "react"
import QueueItem from "./queueItem"
import { useSongReply } from "./useSongReply"

export default function Queue({
	initQueue,
	auth,
	guildId,
}: {
	initQueue: string[]
	auth: string
	guildId: string
}) {
	const { data } = useSongReply({ guildId, auth })

	const [queue, setQueue] = useState<string[]>(initQueue)
	useEffect(() => {
		if (data) {
			setQueue(data.queue)
		}
	}, [data])

	return (
		<Reorder.Group
			axis="y"
			values={initQueue}
			onReorder={setQueue}
			onMouseUp={() => {
				editAction(auth, SongEditType.SetQueue, guildId, queue)
			}}
			className="flex flex-col w-full justify-center items-center"
		>
			{queue.map((v, i) => (
				<QueueItem auth={auth} guildId={guildId} index={i} value={v} key={v} />
			))}
		</Reorder.Group>
	)
}
