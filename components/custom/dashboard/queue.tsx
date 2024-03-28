import { Reorder } from 'framer-motion'
import { SongEditType } from '@/lib/api/song'
import { editAction } from '@/lib/api/web'
import { useEffect, useState } from 'react'
import QueueItem from './queueItem'
import { useSongReply } from './useSongReply'

export default function Queue({
	initQueue,
	auth,
	guildId,
	visitor,
}: {
	initQueue: string[]
	auth: string
	guildId: string
	visitor: boolean
}) {
	const { data } = useSongReply({ guildId, auth, visitor })

	const [oldQueue, setOldQueue] = useState<string[]>(initQueue)
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
				if (oldQueue !== queue) {
					editAction(auth, SongEditType.SetQueue, guildId, visitor, queue)
					setOldQueue(queue)
				}
			}}
			className="flex flex-col w-full justify-center items-center"
		>
			{queue.map((v, i) => (
				<QueueItem
					auth={auth}
					guildId={guildId}
					index={i}
					value={v}
					key={v}
					visitor={visitor}
				/>
			))}
		</Reorder.Group>
	)
}
