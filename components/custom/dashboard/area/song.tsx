"use client"
import { Skeleton } from "@/components/ui/skeleton"
import useSWR, { mutate } from "swr"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { SongDashboard } from "../songDashboard"
import { Button } from "@/components/ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"

export default function SongTab({ auth }: { auth: string }) {
	const {
		data,
		isLoading,
	}: {
		data: { content: { id: string; name: string }[] } | undefined
		isLoading: boolean
	} = useSWR("/api/playingGuildIds", async url => {
		return await (
			await fetch(url, {
				headers: {
					Authorization: `Basic ${auth}`,
				},
			})
		).json()
	})

	const [value, setValue] = useState<null | string>()

	function onSelectValueChange(v: string) {
		setValue(v)
	}
	useEffect(() => {
		if (data?.content && data?.content.length > 0) return
		setValue(null)
	}, [data?.content])

	return (
		<>
			{isLoading ? (
				<Skeleton />
			) : (
				<div className="">
					<div className="flex gap-2 items-center">
						<Select
							onValueChange={onSelectValueChange}
							disabled={!(data?.content && data?.content?.length > 0)}
						>
							<SelectTrigger className="">
								<SelectValue placeholder="Guilds" />
							</SelectTrigger>
							<SelectContent>
								{data?.content.map(v => (
									<SelectItem value={v.id} key={v.id}>
										{v.name} (ID: {v.id})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{value ? (
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									mutate("/api/song/get/" + value)
									mutate("/api/playingGuildIds")
								}}
							>
								<ReloadIcon className="" />
							</Button>
						) : (
							<></>
						)}
					</div>
					{value && <SongDashboard auth={auth} guildId={value} />}
				</div>
			)}
		</>
	)
}
