import { Log } from "./log"
import { SongEditType } from "./song"

export async function login(auth: string): Promise<boolean> {
    const req = await fetch('/api/new', {
        headers: { Authorization: `Basic ${auth}` }
    })

    return req.ok
}
export async function logout(auth: string): Promise<boolean> {
    const req = await fetch('/api/logout', {
        headers: { Authorization: `Basic ${auth}` }
    })
    return req.ok
}

interface ActionData {
    action: 'exit'
}

export function postAction(auth: string, data: ActionData) {
    return fetch('/api/action', {
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export async function getLog(auth: string): Promise<{ content: Log[] | null }> {
    const req = await fetch('/api/log', {
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }
    })
    if (!req.ok) {
        return { content: null }
    }
    return await req.json()
}

export async function editAction(auth: string, action: SongEditType.SetTime, guildId: string, time: number): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.AddSong, guildId: string, url: string): Promise<boolean>
export async function editAction(auth: string, action: SongEditType, guildId: string): Promise<boolean>
export async function editAction(auth: string, action: SongEditType, guildId: string, data?: number | string): Promise<boolean> {
    switch (action) {
        case SongEditType.AddSong: {
            const req = await fetch('/api/song/edit', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    guildId,
                    detail: {
                        url: data
                    }
                })
            })
            return req.ok
        }
        case SongEditType.SetTime: {
            const req = await fetch('/api/song/edit', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    guildId,
                    detail: {
                        sec: data
                    }
                })
            })
            return req.ok
        }
        default: {
            const req = await fetch('/api/song/edit', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    guildId
                })
            })
            return req.ok
        }
    }
}