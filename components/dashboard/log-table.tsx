"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { LogFormatted, type Log } from "@/lib/api/types"
import { formatLogDate } from "@/lib/format"
import { DataTable } from "./data-table"

interface LogRow {
	type: string
	extraType: string
	time: string
	message: string
	isError: boolean
}

const columns: ColumnDef<LogRow>[] = [
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => <Badge variant={row.original.isError ? "destructive" : "secondary"}>{row.original.type}</Badge>,
	},
	{
		accessorKey: "extraType",
		header: "Context",
		cell: ({ getValue }) => getValue<string>() || <span className="text-zinc-600">—</span>,
	},
	{
		accessorKey: "time",
		header: "Time",
		cell: ({ getValue }) => <span className="whitespace-nowrap font-mono text-xs text-zinc-400">{getValue<string>()}</span>,
	},
	{
		accessorKey: "message",
		header: "Message",
		cell: ({ getValue }) => <span className="break-words text-zinc-200">{getValue<string>()}</span>,
	},
]

/** Searchable table of every log type, newest entries first. */
export function LogTable({ logs }: { logs: Log[] }) {
	const rows: LogRow[] = logs.map(log => ({
		message: log.message,
		time: formatLogDate(log.time),
		type: LogFormatted[log.type],
		extraType: LogFormatted[log.extraType ?? "null"],
		isError: ["error", "errim", "errwn", "experr"].includes(log.type),
	}))

	return <DataTable columns={columns} data={rows} emptyMessage="No log entries found." />
}
