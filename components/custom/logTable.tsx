"use client"
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Log, LogType, columns } from "@/lib/api/log"
import { getLog, login } from "@/lib/api/web"
import { useEffect, useState } from "react"
import LogCell from "../logCell"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "./dataTable"

export default function LogTable({
	auth,
	type,
	caption,
}: {
	auth: string
	type: LogType[]
	caption: string
}) {
	const [data, setData] = useState<Log[]>([])
	useEffect(() => {
		login(auth)
		const id = setInterval(async () => {
			const { content } = await getLog(auth)
			if (content === null) {
				window.localStorage.removeItem("key")
				return
			}
			setData([...data, ...content])
			console.log(data, content)
		}, 2000)
		return () => clearInterval(id)
	}, [])

	return <DataTable columns={columns} data={data} />
}
