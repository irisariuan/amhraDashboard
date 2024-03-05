"use client"
import { Label } from "@/components/ui/label"
import { SongEditType, SongReply, YoutubeVideoRegex } from "@/lib/api/song"
import useSWR from "swr"
import Area from "../area"
import { Button } from "@/components/ui/button"
import { editAction, queryYoutube } from "@/lib/api/web"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import moment from "moment"
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	Form,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Skeleton } from "@/components/ui/skeleton"
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card"

const formSchema = z.object({
	url: z.string().min(1),
})

export function SongDashboard({
	auth,
	guildId,
}: {
	auth: string
	guildId: string
}) {
	const { data, isLoading }: { data: SongReply | null; isLoading: boolean } =
		useSWR("/api/song/get/" + guildId, async url => {
			return await (
				await fetch(url, {
					headers: {
						Authorization: `Basic ${auth}`,
					},
				})
			).json()
		})

	async function handleClick(action: SongEditType) {
		if (await editAction(auth, action, guildId)) {
			toast("Ok")
		} else {
			toast("Failed to run")
		}
	}
	async function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
		let url = values.url
		if (!YoutubeVideoRegex.test(values.url)) {
			const query = await queryYoutube(auth, values.url)
			url = query.url
			toast("Found song " + query.title)
		}
		if (await editAction(auth, SongEditType.AddSong, guildId, url)) {
			return toast("Added song to queue")
		}
		return toast("Failed to add to queue")
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: "",
		},
	})

	return (
		<>
			{!data ? (
				<Skeleton />
			) : (
				<div className="mt-10 gap-4 flex flex-col">
					<div className="flex flex-col gap-4">
						<Label className="text-2xl font-semibold">Song Action</Label>
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
						<div className="">
							<div className="flex gap-2 items-center">
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
						</div>
					</div>
					<Area title="Now Playing">
						{data.song ? (
							<div className="flex items-center gap-2">
								<HoverCard>
									<HoverCardTrigger>
										<Label className="text-lg underline-offset-2 underline hover:cursor-pointer">
											{data?.song?.title ?? "null"}
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
												.duration(data?.song?.duration ?? 0, "seconds")
												.as("milliseconds")
										)
										.format("HH:mm:ss")}
								</Label>
							</div>
						) : (
							<Label>Not playing song</Label>
						)}
					</Area>
					<Area title="Queue items">
						{data.queue.length > 0 ? (
							<ul className="max-w-full overflow-auto">
								{data?.queue?.map((v, i) => (
									<li key={i}>
										<Label className="mr-2 font-bold text-base">{i + 1}.</Label>
										<a href={v}>
											<Label className="underline text-blue-500 text-base hover:cursor-pointer">
												{v}
											</Label>
										</a>
									</li>
								))}
							</ul>
						) : (
							<Label className="text-slate-400 italic text-lg font-light">
								No song in queue
							</Label>
						)}
					</Area>
				</div>
			)}
		</>
	)
}
