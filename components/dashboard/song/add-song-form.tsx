"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircledIcon } from "@radix-ui/react-icons"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { mutate } from "swr"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { editSong, songKey } from "@/lib/api/songs"
import { SongEditType, YoutubeVideoRegex } from "@/lib/api/types"
import { searchYoutube } from "@/lib/api/videos"

const formSchema = z.object({ url: z.string().min(1) })

/** Adds a song by YouTube URL, or resolves a free-text query via search first. */
export function AddSongForm({ guildId }: { guildId: string }) {
	const [busy, setBusy] = useState(false)
	const { register, handleSubmit, reset } = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { url: "" },
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		setBusy(true)
		try {
			let url = values.url
			if (!YoutubeVideoRegex.test(values.url)) {
				const result = await searchYoutube(values.url)
				url = result.url
				toast(`Found "${result.title}"`)
			}
			if (await editSong(guildId, SongEditType.AddSong, { url })) {
				mutate(songKey(guildId))
				reset()
				toast("Added to queue")
			} else {
				toast("Failed to add to queue")
			}
		} finally {
			setBusy(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex w-full items-center gap-2">
			<Input
				placeholder="Paste a YouTube URL or search…"
				className="flex-1 bg-white/5 border-white/10"
				disabled={busy}
				{...register("url")}
			/>
			<Button type="submit" disabled={busy} size="icon">
				<PlusCircledIcon />
			</Button>
		</form>
	)
}
