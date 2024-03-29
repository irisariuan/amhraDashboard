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
import moment from 'moment'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Slider } from '@/components/ui/slider'
import { useEffect, useState } from 'react'
import Queue from './queue'
import { useSongReply } from './useSongReply'
import { ReloadIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'

const formSchema = z.object({
	url: z.string().min(1),
})

export function SongDashboard({
	auth,
	guildId,
	visitor = false,
}: {
	auth: string
	guildId: string
	visitor: boolean
}) {
	const [volume, setVolume] = useState(0)
	const [waited, setWaited] = useState(false)
	const { data, isLoading } = useSongReply({ guildId, auth, visitor })

	async function handleClick(action: SongEditType) {
		if (await editAction(auth, action, guildId, visitor)) {
			toast(FormatSongEditType[action])
		} else {
			toast('Failed to run')
		}
		mutate('/api/song/get/' + guildId)
	}
	async function onSubmit(values: z.infer<typeof formSchema>) {
		let url = values.url
		if (!YoutubeVideoRegex.test(values.url)) {
			const query = await queryYoutube(auth, values.url, visitor)
			url = query.url
			toast('Found song ' + query.title)
		}
		if (await editAction(auth, SongEditType.AddSong, guildId, visitor, url)) {
			mutate('/api/song/get/' + guildId)
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
		if (data) {
			setVolume(Math.round(data.volume * 100))
		} else {
			setVolume(-1)
		}
	}, [data])

	useEffect(() => {
		const id = setTimeout(() => {
			console.log('Waiting too long!')
			setWaited(true)
		}, 2000)
		return () => {
			clearInterval(id)
		}
	}, [])

	return (
		<>
			{!data || isLoading ? (
				<div className="w-full h-full flex items-center justify-center flex-col gap-2">
					<div className="flex items-center justify-center gap-1">
						<p className="text-xl lg:text-3xl font-semibold">Loading...</p>
						<motion.div
							animate={{
								rotate: [0, 360],
							}}
							transition={{
								repeat: Infinity,
								type: 'spring',
								bounce: 0.2,
								duration: 1,
								repeatDelay: 0.5,
							}}
						>
							<ReloadIcon className="h-6 w-6 lg:h-8 lg:w-8" />
						</motion.div>
					</div>
					<>
						{waited && (
							<motion.p animate={{ opacity: [0, 1], y: [20, 0], scale: [0.6, 1] }} transition={{duration: 0.5, type: 'tween'}} className='text-center'>
								The music player may not been initialized yet, please check if it is initialized
							</motion.p>
						)}
					</>
				</div>
			) : (
				<div className="mt-10 gap-4 flex flex-col">
					<div className="flex flex-col gap-4">
						<Label className="text-3xl font-semibold">Song Action</Label>
						<div className="">
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
										<Button type="submit" className="">
											Add
										</Button>
									</div>
								</form>
							</Form>
						</div>
						<div className="flex flex-col gap-2">
							<div className="flex gap-2 items-center max-w-full flex-wrap">
								<Button
									onClick={() => {
										handleClick(SongEditType.Pause)
									}}
								>
									Pause
								</Button>
								<Button
									onClick={() => {
										handleClick(SongEditType.Resume)
									}}
								>
									Resume
								</Button>
								<Button
									onClick={() => {
										handleClick(SongEditType.Skip)
									}}
								>
									Skip
								</Button>
								<Button
									onClick={() => {
										handleClick(SongEditType.Stop)
									}}
								>
									Stop
								</Button>
							</div>
							<div className="">
								<Label>Volume</Label>
								<div className="flex gap-2">
									<Slider
										defaultValue={[data.volume * 100]}
										max={150}
										step={1}
										onValueCommit={async v => {
											if (
												!(await editAction(
													auth,
													SongEditType.SetVolume,
													guildId,
													visitor,
													(v[0] ?? 0) / 100
												))
											) {
												toast('Failed to set volume')
											}
										}}
										onValueChange={v => {
											setVolume(v[0])
										}}
									/>
									<Label>{volume}%</Label>
								</div>
							</div>
						</div>
					</div>
					<Area title="Now Playing">
						{data.song ? (
							<div className="flex items-center gap-2">
								<HoverCard>
									<HoverCardTrigger>
										<Label className="text-lg underline-offset-2 underline hover:cursor-pointer">
											{data?.song?.title ?? 'null'}
										</Label>
										<HoverCardContent className="flex overflow-hidden w-auto flex-col gap-2">
											<div className="flex gap-2 items-center">
												<Label>Song Link</Label>
												<a href={data?.song.link}>
													<Label className="underline text-blue-500 hover:cursor-pointer">
														{data?.song.link}
													</Label>
												</a>
											</div>
											<div className="flex gap-2 items-center">
												<Label>Channel Link</Label>
												<a href={data?.song.channel}>
													<Label className="underline text-blue-500 hover:cursor-pointer">
														{data?.song.channel}
													</Label>
												</a>
											</div>
										</HoverCardContent>
									</HoverCardTrigger>
								</HoverCard>
								<Label className="bg-blue-500 text-white p-2 rounded-lg">
									{moment
										.utc(
											moment
												.duration(data?.song?.duration ?? 0, 'seconds')
												.as('milliseconds')
										)
										.format('HH:mm:ss')}
								</Label>
							</div>
						) : (
							<Label className="text-slate-500 italic">Not playing song</Label>
						)}
					</Area>
					<Area title="Queue">
						{!data.queue ? (
							<Label className="text-red-500 italic">An error occurred</Label>
						) : data.queue?.length > 0 ? (
							<Queue
								initQueue={data.queue}
								auth={auth}
								guildId={guildId}
								visitor={visitor}
							/>
						) : (
							<Label className="text-slate-500 italic">No song in queue</Label>
						)}
					</Area>
				</div>
			)}
		</>
	)
}
