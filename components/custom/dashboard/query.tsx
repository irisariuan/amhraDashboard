import { queryDetails } from '@/lib/api/web'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { ClockIcon } from 'lucide-react'
import moment from 'moment'
import useSWR from 'swr'
import ReloadCircle from '../reloadCircle'

export const revalidate = 3600

export default function Query({
	url,
	visitor,
	auth,
}: {
	url: string
	visitor: boolean
	auth: string
}) {
	const { data, isLoading, error } = useSWR(url, async () => {
		return await queryDetails(auth, url, visitor)
	})
	return !isLoading && data && !error ? (
		<div className="flex flex-col gap-2">
			<a href={url}>{data.title}</a>
			<a href={data.channel?.url} className="text-zinc-500 underline">
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
		<>
			<ReloadCircle />
		</>
	)
}
