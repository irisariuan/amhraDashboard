"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { mutate } from "swr"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, YoutubeVideoRegex } from "@/lib/api/types"
import { searchYoutube } from "@/lib/api/videos"
import type { GuildSession } from "@/lib/session"

const formSchema = z.object({
	url: z.string().min(1),
})

/** Adds a song by YouTube URL, or resolves a free-text query via search first. */
export function AddSongForm({ session }: { session: GuildSession }) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { url: "" },
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		let url = values.url
		if (!YoutubeVideoRegex.test(values.url)) {
			const result = await searchYoutube(values.url, session)
			url = result.url
			toast(`Found song ${result.title}`)
		}
		if (await editSong(session, SongEditType.AddSong, { url })) {
			mutate(songKey(session.guildId))
			return toast("Added song to queue")
		}
		return toast("Failed to add to queue")
	}

	return (
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
											className="text-base placeholder:text-sm"
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
	)
}
