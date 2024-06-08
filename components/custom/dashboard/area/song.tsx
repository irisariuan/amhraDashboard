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

export default function SongTab({ auth, bearer = false }: { auth: string, bearer?: boolean }) {
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
					Authorization: `${bearer ? 'Bearer' : 'Basic'} ${auth}`,
				},
			})
		).json()
	})

	const [guildId, setGuildId] = useState<null | string>()

	function onSelectValueChange(v: string) {
		setGuildId(v)
	}

	useEffect(() => {
		if (data?.content && data?.content.length > 0) return
		setGuildId(null)
	}, [data?.content])

	return (
		<>
			{isLoading ? (
				<Skeleton className="w-[100px] h-[20px] rounded-full" />
			) : (
				<div>
					<div className="flex gap-2 items-center">
						<Select
							onValueChange={onSelectValueChange}
							disabled={!(data?.content && data?.content?.length > 0)}
						>
							<SelectTrigger>
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
						{guildId ? (
							<Button
								variant="outline"
								size="icon"
								onClick={() => {
									mutate(`/api/song/get/${guildId}`)
									mutate("/api/playingGuildIds")
								}}
							>
								<ReloadIcon />
							</Button>
						) : (
							<></>
						)}
					</div>
					{guildId && <SongDashboard auth={auth} guildId={guildId} visitor={false} bearer={bearer} />}
				</div>
			)}
		</>
	)
}
