import { Reorder } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SongEditType } from "@/lib/api/song"
import { editAction } from "@/lib/api/web"
import { Label } from "@/components/ui/label"
import { TrashIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { useState } from "react"
import QueueItem from "./queueItem"

export default function Queue({
	initQueue,
	auth,
	guildId,
}: {
	initQueue: string[]
	auth: string
	guildId: string
}) {
	const [queue, setQueue] = useState(initQueue)

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
