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
	async function updateLog() {
		const { content } = await getLog(auth)
		if (content === null) {
			window.localStorage.removeItem("key")
			return
		}
		setData([...data, ...content])
	}
	
	const [data, setData] = useState<Log[]>([])
	useEffect(() => {
		const id = setInterval(() => {
			updateLog()
		}, 2000)
		return () => clearInterval(id)
	}, [])
	useEffect(() => {
		console.log(data)
	}, [data])

	return <DataTable columns={columns} data={data} />
}
