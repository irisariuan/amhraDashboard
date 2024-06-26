import type { AuthData } from '@/lib/api/web'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { ClockIcon } from 'lucide-react'
import moment from 'moment'
import ReloadCircle from '../reloadCircle'
import { useQuery } from './useQuery'

export const revalidate = 3600

export default function Query({
	url,
	authData
}: {
	url: string
	authData: AuthData
}) {
	const { data, isLoading, error } = useQuery({ url, authData })
	
	return !isLoading && data && !error ? (
		<div className="flex flex-col gap-2">
			<a href={url} rel="noreferrer" target='_blank'>{data.title}</a>
			<a href={data.channel?.url} rel="noreferrer" target='_blank' className="text-zinc-500 underline">
				{data.channel?.name}
			</a>
			<div className="flex gap-2">
				<div className="flex bg-blue-500 rounded-lg px-2 items-center gap-2 text-blue-300">
					<ClockIcon className="w-4" />
					<p className=" text-white">
						{moment
							.utc(
								moment
									.duration(data.durationInSec ?? 0, 'seconds')
									.as('milliseconds')
							)
							.format('HH:mm:ss')}
					</p>
				</div>
				<div className="flex items-center gap-2 bg-zinc-200 px-2 rounded-lg text-zinc-500">
					<EyeOpenIcon />
					<span>{data.views}</span>
				</div>
			</div>
		</div>
	) : (
		<div className='w-min h-min overflow-hidden'>
			<ReloadCircle />
		</div>
	)
}
