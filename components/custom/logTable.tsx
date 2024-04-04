import { type Log, LogFormatted, type LogType, columns } from "@/lib/api/log"
import { DataTable } from "./dataTable"
import moment from "moment"
import { Skeleton } from "@/components/ui/skeleton"
import { useLog } from "@/lib/customSwr"
import { useEffect } from "react"
import { redirect } from "next/navigation"

export default function LogTable({
	auth,
	type,
	caption,
}: {
	auth: string
	type: LogType[]
	caption: string
}) {
	const { data, isLoading, error } = useLog(auth)
	useEffect(() => {
		if (error && !isLoading) {
			window.localStorage.removeItem("key")
			redirect("/login")
		}
	}, [error, isLoading])

	return (
		<>
			{isLoading ? (
				<Skeleton className="w-[100px] h-[20px] rounded-full" />
			) : (
				<DataTable
					columns={columns}
					data={
						data?.content
							?.filter(v => type.includes(v.type))
							.map(v => {
								return {
									message: v.message,
									time: moment(v.time).format("lll"),
									type: LogFormatted[v.type],
									extraType: LogFormatted[v.extraType ?? 'null'],
								} as Log
							}) ?? []
					}
				/>
			)}
		</>
	)
}
