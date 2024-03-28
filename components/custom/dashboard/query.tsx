import { YoutubeVideoData, queryDetails } from '@/lib/api/web'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { ClockIcon } from 'lucide-react'
import moment from 'moment'

const videoCache = new Map<string, YoutubeVideoData>()

export default async function Query({
	url,
	visitor,
	auth,
}: {
	url: string
	visitor: boolean
	auth: string
}) {
	const { title, durationInSec, channel, views } = await queryDetails(
		auth,
		url,
		visitor
	)

	return (
		<div className='flex flex-col gap-2'>
			<a href={url}>{title}</a>
			<a href={channel.url} className="text-slate-500 underline">
				{channel.name}
			</a>
			<div className="flex gap-2">
				<div className="flex bg-blue-500 rounded-lg px-2 items-center gap-2 text-blue-300">
					<ClockIcon className='w-4'/>
					<p className=" text-white">
						{moment
							.utc(moment.duration(durationInSec, 'seconds').as('milliseconds'))
							.format('HH:mm:ss')}
					</p>
				</div>
				<div className="flex items-center gap-2 bg-slate-200 px-2 rounded-lg text-slate-500">
					<EyeOpenIcon />
					<span>{views}</span>
				</div>
			</div>
		</div>
	)
}
