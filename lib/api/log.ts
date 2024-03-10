import { ColumnDef } from "@tanstack/react-table"
export const columns: ColumnDef<Log>[] = [
    {
        accessorKey: 'type',
        header: 'Type'
    }, {
        accessorKey: 'extraType',
        header: 'Extra Type'
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
    extraType?: ExtraType
    time: string
}

export type ExtraType = 'voice' | 'delete' | 'edit'
export type LogType = 'dcblog' | 'dcbmsg' | 'explog' | 'experr' | 'error' | 'errim' | 'errwn'
export const LogFormatted: Record<LogType | ExtraType | 'null', string> = {
    dcblog: 'Bot Log',
    dcbmsg: 'Message',
    errim: 'Important',
    error: 'Error',
    errwn: 'Warning',
    experr: 'Express Error',
    explog: 'Express Log',
    voice: 'Voice',
    delete: 'Delete',
    edit: 'Edit',
    null: ''
} as const