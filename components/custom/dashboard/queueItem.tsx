import { Button } from '@/components/ui/button'
import { SongEditType } from '@/lib/api/song'
import { editAction } from '@/lib/api/web'
import { Label } from '@/components/ui/label'
import { TrashIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { Reorder } from 'framer-motion'
import { useQuery } from './useQuery'
import LinkCard from './link'

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
		<Reorder.Item value={value} key={value} className="w-full">
			<div className="break-words w-full flex items-center hover:cursor-grab active:cursor-grabbing gap-2">
				<div className="flex-1 overflow-hidden">
					<Label className="mr-2 font-bold text-base">{index + 1}.</Label>
					<LinkCard value={value} auth={auth} visitor={visitor} />
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
						mutate(`/api/song/get/${guildId}`)
					}}
				>
					<TrashIcon />
				</Button>
			</div>
		</Reorder.Item>
	)
}
