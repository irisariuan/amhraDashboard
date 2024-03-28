import { Button } from '@/components/ui/button'
import { SongEditType } from '@/lib/api/song'
import { editAction } from '@/lib/api/web'
import { Label } from '@/components/ui/label'
import { TrashIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { Reorder } from 'framer-motion'
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Suspense } from 'react'
import Query from './query'

export default function QueueItem({
	auth,
	guildId,
	index,
	value,
	visitor,
}: {
	auth: string
	guildId: string
	index: number
	value: string
	visitor: boolean
}) {
	return (
		<Reorder.Item value={value} key={value} className="w-full overflow-auto">
			<div className="break-words w-full flex items-center hover:cursor-grab active:cursor-grabbing gap-2">
				<div className="flex-1">
					<Label className="mr-2 font-bold text-base">{index + 1}.</Label>
					<HoverCard>
						<HoverCardTrigger>
							<a href={value}>
								<Label className="underline text-blue-500 text-base hover:cursor-pointer break-words">
									{value}
								</Label>
							</a>
						</HoverCardTrigger>
						<HoverCardContent className='w-full'>
							<Suspense>
								<Query url={value} visitor={visitor} auth={auth} />
							</Suspense>
						</HoverCardContent>
					</HoverCard>
				</div>
				<Button
					variant="outline"
					onClick={async () => {
						if (
							await editAction(
								auth,
								SongEditType.RemoveSong,
								guildId,
								visitor,
								index
							)
						) {
							toast('Removed song from queue')
						} else {
							toast('Failed to remove song from queue')
						}
						mutate('/api/song/get/' + guildId)
					}}
				>
					<TrashIcon />
				</Button>
			</div>
		</Reorder.Item>
	)
}
