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
	}: { data: { ids: string[] } | undefined; isLoading: boolean } = useSWR(
		"/api/guildIds",
		async url => {
			return await (
				await fetch(url, {
					headers: {
						Authorization: `Basic ${auth}`,
					},
				})
			).json()
		}
	)

	const [value, setValue] = useState<null | string>()

	function onSelectValueChange(v: string) {
		setValue(v)
	}
	useEffect(() => {
		if (data?.ids && data?.ids.length > 0) return
		setValue(null)
	}, [data?.ids])

	return (
		<>
			{isLoading ? (
				<Skeleton />
			) : (
				<div className="">
					<div className="flex gap-2 items-center">
						<Select
							onValueChange={onSelectValueChange}
							disabled={!(data?.ids && data?.ids?.length > 0)}
						>
							<SelectTrigger className="">
								<SelectValue placeholder="Guilds" />
							</SelectTrigger>
							<SelectContent>
								{data?.ids.map(v => (
									<SelectItem value={v} key={v}>
										{v}
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
									mutate("/api/guildIds")
								}}
							>
								<ReloadIcon className="" />
							</Button>
						) : (
							<></>
						)}
					</div>
					{value ? <SongDashboard auth={auth} guildId={value} /> : <></>}
				</div>
			)}
		</>
	)
}
