import { Log } from "@/lib/api/log";
import { TableRow, TableCell } from "./ui/table";

export default function LogCell({log}: {log: Log}) {
	return (
		<TableRow>
			<TableCell className="font-medium">{log.type}</TableCell>
			<TableCell>{log.time}</TableCell>
			<TableCell>{log.message}</TableCell>
		</TableRow>
	)
}
