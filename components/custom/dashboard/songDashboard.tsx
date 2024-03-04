"use client"
import { Label } from "@/components/ui/label"
import { SongEditType, SongReply } from "@/lib/api/song"
import useSWR from "swr"
import Area from "../area"
import { Button } from "@/components/ui/button"
import { editAction } from "@/lib/api/web"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
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

const formSchema = z.object({
	url: z
		.string()
		.url()
		.regex(
			/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
		),
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
			toast('Ok')
		} else {
			toast('Failed to run')
		}
	}
	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values)
	}

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: "",
		},
	})

	return (
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
													<Input placeholder="YouTube URL" {...field} />
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
					<div className="flex gap-2">
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
			<Area title="Queue items">
				<ul>
					{data?.queue.map((v, i) => (
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
			</Area>
		</div>
	)
}
