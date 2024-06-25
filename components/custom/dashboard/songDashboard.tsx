'use client'
import { Label } from '@/components/ui/label'
import {
	FormatSongEditType,
	SongEditType,
	YoutubeVideoRegex,
} from '@/lib/api/song'
import { mutate } from 'swr'
import Area from '../area'
import { Button } from '@/components/ui/button'
import { editAction, queryYoutube } from '@/lib/api/web'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	Form,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import Queue from './queue'
import { useSongReply } from './useSongReply'
import { ExitIcon, PauseIcon, PlusCircledIcon, ResumeIcon, StopIcon, TrackNextIcon } from '@radix-ui/react-icons'
import Query from './query'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import HistoryItem from '../historyItem'
import PlaybackControl from '../ui/playbackControl'
import DashboardPlaceholder from './dashboardPlaceholder'
import Controllable from '../ui/controllableBar'

const formSchema = z.object({
	url: z.string().min(1),
})

export function SongDashboard({
	auth,
	guildId,
	visitor = false,
	bearer = false
}: {
	auth: string
	guildId: string
	visitor: boolean
	bearer?: boolean
}) {
	const [volume, setVolume] = useState(0)
	const [time, setTime] = useState<number | null>(null)
	const [waited, setWaited] = useState(false)
	const { data, isLoading } = useSongReply({ guildId, auth, visitor, bearer })
	const authData = { auth, bearer, guildId, visitor }
	async function handleClick(action: SongEditType) {
		if (await editAction(action, authData)) {
			toast(FormatSongEditType[action])
		} else {
			toast('Failed to run')
		}
		await mutate(`/api/song/get/${guildId}`)
	}
	async function onSubmit(values: z.infer<typeof formSchema>) {
		let url = values.url
		if (!YoutubeVideoRegex.test(values.url)) {
			const query = await queryYoutube(values.url, authData)
			url = query.url
			toast(`Found song ${query.title}`)
		}
		if (await editAction(SongEditType.AddSong, authData, url)) {
			mutate(`/api/song/get/${guildId}`)
			return toast('Added song to queue')
		}
		return toast('Failed to add to queue')
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: '',
		},
	})

	useEffect(() => {
		const id = setTimeout(() => {
			console.log('Waiting too long!')
			setWaited(true)
		}, 2000)
		return () => {
			clearTimeout(id)
		}
	}, [])

	useEffect(() => {
		if (!data) {
			return setVolume(-1)
		}
		setVolume(data.volume * 100)

		if (data.song && (!data.paused || time === null)) {
			setTime((Date.now() - data.song.startTime + data.song.startFrom) / 1000)
		}

		const intervalId = setInterval(() => {
			if (!data) return
			if (!data.paused) {
				if (data.song) {
					return setTime((Date.now() - data.song.startTime - data.pausedInMs + data.song.startFrom) / 1000)
				}
				return setTime(0)
			}
			if (data.paused && data.song) {
				setTime((data.pausedTimestamp - data.song.startTime - data.pausedInMs + data.song.startFrom) / 1000)
			}
			if ((time ?? 0) < 0) {
				setTime(0)
			}
		}, 100)
		return () => {
			clearInterval(intervalId)
		}

	}, [data])

	return (
		<>
			{!data || isLoading ? (
				<DashboardPlaceholder showWaitedMessage={waited} />
			) : (
				<div className="mt-10 gap-4 flex flex-col">
					<div className="flex flex-col gap-4">
						<Label className="text-3xl font-semibold">Song Dashboard</Label>
						<div>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)}>
									<div className="flex w-full items-center gap-2">
										<div className="flex-1">
											<FormField
												control={form.control}
												name="url"
												render={({ field }) => (
													<FormItem>
														<FormLabel>URL</FormLabel>
														<FormControl>
															<Input
																placeholder="YouTube URL or query items"
																{...field}
															/>
														</FormControl>
														<FormDescription>
															YouTube URL to be added to queue
														</FormDescription>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
										<Button type="submit">
											<PlusCircledIcon />
										</Button>
									</div>
								</form>
							</Form>
						</div>
						<div className="flex flex-col gap-2">
							<div className="flex gap-2 items-center justify-center w-full [&>*]:w-full md:[&>*]:w-auto">
								{data.song && <>
									{
										data.paused ? (
											<Button
												onClick={() => {
													handleClick(SongEditType.Resume)
												}}
											>
												<ResumeIcon />
											</Button>

										) : (
											<Button
												onClick={() => {
													handleClick(SongEditType.Pause)
												}}
											>
												<PauseIcon />
											</Button>
										)
									}
									<Button
										onClick={() => {
											handleClick(SongEditType.Skip)
										}}
									>
										<TrackNextIcon />
									</Button>
								</>}
								<Button
									onClick={() => {
										handleClick(SongEditType.Stop)
									}}
								>
									<StopIcon />
								</Button>
								<Button
									onClick={() => {
										handleClick(SongEditType.Quit)
									}}
								>
									<ExitIcon />
								</Button>
							</div>
							<div className="">
								<Label>Volume</Label>
								<div className="flex gap-2 items-center">
									<Controllable now={data.volume} totalValue={1} onRelease={async v => {
										if (
											!(await editAction(
												SongEditType.SetVolume,
												authData,
												Number.parseFloat(v.toFixed(3))
											))
										) {
											return toast('Failed to set volume')
										}
										mutate(`/api/song/get/${guildId}`)
									}} enabled formatter={v => `${(v * 100).toFixed(1)}%`} />
									<Label>{volume.toFixed(1)}%</Label>
								</div>
							</div>
						</div>
					</div>
					<Area title="Now Playing">
						{data.song ? (
							<div className="flex flex-col gap-2 w-full">
								<Query url={data.song.link} authData={authData} />
								<div className="flex flex-col">
									<div className="w-full">
										<PlaybackControl now={time ?? 0} totalTime={data.song.duration} enabled={data.canSeek} onRelease={async releaseTime => {
											if (!(await editAction(SongEditType.SetTime, authData, Math.round(releaseTime)))) {
												return toast('Failed to seek')
											}
											mutate(`/api/song/get/${guildId}`)
										}} />
									</div>
									<Label className="text-neutral-700 dark:text-white">
										{`${Math.floor((time ?? 0) / 60).toString().padStart(2, '0')}:${Math.floor((time ?? 0) % 60).toString().padStart(2, '0')}`}/{Math.floor(data.song.duration / 60).toString().padStart(2, '0')}:{(data.song.duration % 60).toString().padStart(2, '0')}
									</Label>
								</div>
							</div>
						) : (
							<Label className="text-zinc-500 italic">Not playing song</Label>
						)}
					</Area>
					<div>
						<Accordion type='single' collapsible>
							<AccordionItem value='history'>
								<AccordionTrigger>
									<h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
										History
									</h2>
								</AccordionTrigger>
								<AccordionContent>
									{!data.history ? (
										<Label className="text-red-500 italic">An error occurred</Label>
									) : data.history?.length > 0 ? (
										<div className='flex flex-col gap-2'>
											{Array.from(new Set(data.history)).map((v, i) => <div key={v}>
												<HistoryItem link={v} authData={authData} />
											</div>)}
										</div>
									) : (
										<Label className="text-zinc-500 italic">No history</Label>
									)}
								</AccordionContent>
							</AccordionItem>
							<AccordionItem value='queue'>
								<AccordionTrigger>
									<h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
										Queue
									</h2>
								</AccordionTrigger>
								<AccordionContent>
									{!data.queue ? (
										<Label className="text-red-500 italic">An error occurred</Label>
									) : data.queue?.length > 0 ? (
										<Queue
											initQueue={data.queue}
											authData={authData}
										/>
									) : (
										<Label className="text-zinc-500 italic">No song in queue</Label>
									)}
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>
				</div>
			)}
		</>
	)
}
