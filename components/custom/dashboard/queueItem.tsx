import { Button } from '@/components/ui/button'
import { SongEditType } from '@/lib/api/song'
import { type AuthData, editAction } from '@/lib/api/web'
import { Label } from '@/components/ui/label'
import { TrashIcon, DragHandleDots1Icon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { mutate } from 'swr'
import { Reorder } from 'framer-motion'
import LinkCard from './link'
import useMobile, { DeviceType } from '../useMobile'

export default function QueueItem({
	authData,
	index,
	value,
}: {
	authData: AuthData
	index: number
	value: string
}) {
	const type = useMobile()
	return (
		<Reorder.Item value={value} key={value} className="w-full">
			<div className="break-words w-full flex items-center hover:cursor-grab active:cursor-grabbing gap-2 hover:dark:bg-neutral-800/50 hover:bg-neutral-200/50 p-2 rounded-xl">
				{
					type === DeviceType.Mobile || type === DeviceType.Tablet &&
					<DragHandleDots1Icon />
				}
				<div className="flex-1 overflow-hidden">
					<Label className="mr-2 font-bold text-base">{index + 1}.</Label>
					<LinkCard value={value} authData={authData} />
				</div>
				<Button
					variant="destructive"
					onClick={async () => {
						if (
							await editAction(
								SongEditType.RemoveSong,
								authData,
								index
							)
						) {
							toast('Removed song from queue')
						} else {
							toast('Failed to remove song from queue')
						}
						mutate(`/api/song/get/${authData.guildId}`)
					}}
				>
					<TrashIcon />
				</Button>
			</div>
		</Reorder.Item>
	)
}
