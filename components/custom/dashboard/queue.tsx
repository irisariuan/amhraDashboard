import { Reorder } from 'framer-motion'
import { SongEditType } from '@/lib/api/song'
import { type AuthData, editAction } from '@/lib/api/web'
import { useEffect, useState } from 'react'
import QueueItem from './queueItem'
import { useSongReply } from './useSongReply'

export default function Queue({
	initQueue,
	authData,
}: {
	initQueue: string[]
	authData: AuthData
}) {
	const { data } = useSongReply(authData)

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
					editAction(SongEditType.SetQueue, authData, queue)
					setOldQueue(queue)
				}
			}}
			className="flex flex-col w-full justify-center items-center gap-2"
		>
			{queue.map((v, i) => (
				<QueueItem
					authData={authData}
					index={i}
					value={v}
					key={v}
				/>
			))}
		</Reorder.Group>
	)
}
