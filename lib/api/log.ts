import { ColumnDef } from "@tanstack/react-table"
export const columns: ColumnDef<Log>[] = [
    {
        accessorKey: 'message',
        header: 'Message'
    }, {
        accessorKey: 'time',
        header: 'Time'
    }, {
        accessorKey: 'type',
        header: 'Type'
    }
]
export interface Log {
    message: string,
    type: LogType,
    time: string
}
export type LogType = 'dcblog' | 'dcbmsg' | 'explog' | 'experr' | 'error' | 'errim' | 'errwn'