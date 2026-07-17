"use client"
import type { ColumnDef } from "@tanstack/react-table"
import { redirect } from "next/navigation"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useLogs } from "@/hooks/use-logs"
import { LogFormatted, type LogType } from "@/lib/api/types"
import { formatLogDate } from "@/lib/format"
import { clearStoredSession, type Session } from "@/lib/session"
import { DataTable } from "./data-table"

interface LogRow {
	type: string
	extraType: string
	time: string
	message: string
}

const columns: ColumnDef<LogRow>[] = [
	{ accessorKey: "type", header: "Type" },
	{ accessorKey: "extraType", header: "Extra Type" },
	{ accessorKey: "time", header: "Time" },
	{ accessorKey: "message", header: "Message" },
]

/** Filterable table of logs restricted to the given log types. */
export function LogTable({
	session,
	types,
}: {
	session: Session
	types: LogType[]
}) {
	const { data, isLoading, error } = useLogs(session)

	useEffect(() => {
		if (error && !isLoading) {
			clearStoredSession()
			redirect("/login")
		}
	}, [error, isLoading])

	if (isLoading) {
		return <Skeleton className="w-[100px] h-[20px] rounded-full" />
	}

	const rows: LogRow[] =
		data
			?.filter(log => types.includes(log.type))
			.map(log => ({
				message: log.message,
				time: formatLogDate(log.time),
				type: LogFormatted[log.type],
				extraType: LogFormatted[log.extraType ?? "null"],
			})) ?? []

	return <DataTable columns={columns} data={rows} />
}
