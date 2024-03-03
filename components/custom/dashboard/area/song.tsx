'use client'
import { Skeleton } from "@/components/ui/skeleton"
import useSWR from "swr"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { useEffect, useRef } from "react"

export default function SongTab({ auth }: { auth: string }) {
	const {
		data,
		isLoading,
	}: { data: { ids: string[] } | undefined; isLoading: boolean } = useSWR(
		"/api/guildIds",
		async (url) => {
			return await (
				await fetch(url, {
					headers: {
						Authorization: `Basic ${auth}`,
					},
				})
			).json()
		}
	)
	

	return (
		<>
			{isLoading ? (
				<Skeleton />
			) : (
				<div className="">
					<Select disabled={!(data?.ids && data?.ids?.length > 0)}>
						<SelectTrigger className="">
							<SelectValue placeholder="Guilds" />
						</SelectTrigger>
						<SelectContent>
							{data?.ids.map((v) => (
								<SelectItem value={v} id={v}>
									{v}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
		</>
	)
}
