import { Skeleton } from "@/components/ui/skeleton"
import type { Guild } from "@/lib/api/log"
import { getAllGuilds } from "@/lib/api/web"
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select"
import { useState, useEffect } from "react"
import useSWR from "swr"
import MessageComponent from "../messages"

export default function MessageTab({ auth }: { auth: string }) {
	const {
		data,
		isLoading,
	}: {
		data: Guild[] | undefined
		isLoading: boolean
	} = useSWR("/api/guildIds/all", async () => {
		return await getAllGuilds(auth)
	})

	const [value, setValue] = useState<null | string>(null)

	function onSelectValueChange(v: string) {
		setValue(v)
	}

	useEffect(() => {
		if (
			!data ||
			!value ||
			data.length <= 0 ||
			!data.map(v => v.id).includes(value)
		) {
			setValue(null)
		}
	}, [data, value])

	return (
		<>
			{isLoading ? (
				<Skeleton className="w-full h-4" />
			) : (
				<div>
					<Select
						onValueChange={onSelectValueChange}
						disabled={!data || data.length <= 0}
					>
						<SelectTrigger className="">
							<SelectValue placeholder="Guilds" />
						</SelectTrigger>
						<SelectContent>
							{data?.map(v => (
									<SelectItem value={v.id} key={v.id}>
										{v.name} (ID: {v.id})
									</SelectItem>
								))}
						</SelectContent>
					</Select>
					{value && (
						<div className="mt-6">
							<MessageComponent authData={{auth, guildId: value}} />
						</div>
					)}
				</div>
			)}
		</>
	)
}
