import { Skeleton } from '@/components/ui/skeleton'
import { YoutubeVideoData, queryDetails } from '@/lib/api/web'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { ClockIcon } from 'lucide-react'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'

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
			<a href={data.channel?.url} className="text-slate-500 underline">
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
				<div className="flex items-center gap-2 bg-slate-200 px-2 rounded-lg text-slate-500">
					<EyeOpenIcon />
					<span>{data.views}</span>
				</div>
			</div>
		</div>
	) : (
		<>
			<Skeleton />
		</>
	)
}
