import { ColumnDef } from "@tanstack/react-table"
export const columns: ColumnDef<Log>[] = [
    {
        accessorKey: 'type',
        header: 'Type'
    }, {
        accessorKey: 'time',
        header: 'Time'
    }, {
        accessorKey: 'message',
        header: 'Message'
    },
]
export interface Log {
    message: string,
    type: LogType,
    time: string
}
export type LogType = 'dcblog' | 'dcbmsg' | 'explog' | 'experr' | 'error' | 'errim' | 'errwn'
export const LogFormatted: Record<LogType, string> = {
    dcblog: 'Bot Log',
    dcbmsg: 'Message',
    errim: 'Important',
    error: 'Error',
    errwn: 'Warning',
    experr: 'Express Error',
    explog: 'Express Log'
} as const