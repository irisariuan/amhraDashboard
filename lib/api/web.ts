import { Channel, Guild, Log } from "./log"
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

export interface ActionData {
    action: 'exit' | 'addAuth'
    guildId?: string
}

export function postAction(auth: string, data: ActionData) {
    return fetch('/api/action', {
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export async function getLog(auth: string): Promise<{ content: Log[] }> {
    const req = await fetch('/api/log', {
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }
    })
    if (!req.ok) {
        return { content: [] }
    }
    let { content }: { content: Log[] } = await req.json()
    content = content.map(log => {
        const v = log.message.match(/\[[A-Z].*\]/)
        if (v?.[0]) {
            log.message = log.message.replace(v[0], '').trim()
            log.extraType = v[0].slice(1, -1).toLowerCase() as 'voice' | 'delete' | 'edit'
        }
        return log
    })
    return { content }
}

export async function editAction(auth: string, action: SongEditType.SetQueue, guildId: string, queue: string[]): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.SetVolume, guildId: string, volume: number): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.RemoveSong, guildId: string, index: number): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.SetTime, guildId: string, time: number): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.AddSong, guildId: string, url: string): Promise<boolean>
export async function editAction(auth: string, action: SongEditType, guildId: string): Promise<boolean>
export async function editAction(auth: string, action: SongEditType, guildId: string, data?: number | string | string[]): Promise<boolean> {
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
        case SongEditType.RemoveSong: {
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
                        index: data
                    }
                })
            })
            return req.ok
        }
        case SongEditType.SetVolume: {
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
                        volume: data
                    }
                })
            })
            return req.ok
        }
        case SongEditType.SetQueue: {
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
                        queue: data
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

export async function queryYoutube(auth: string, query: string): Promise<{ url: string, title: string, durationInSec: number }> {
    return await (await fetch('/api/search', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query
        })
    })).json()
}

export async function getMessages(auth: string, guildId: string) {
    const { content }: { content: Channel[] } = await (await fetch('/api/messages/' + guildId, {
        headers: { Authorization: `Basic ${auth}` }
    })).json() ?? { content: [] }
    return content
}

export async function getAllGuilds(auth: string): Promise<Guild[]> {
    return (await (await fetch('/api/guildIds', {
        headers: { Authorization: `Basic ${auth}` }
    })).json()).content ?? []
}

export async function verifyVisitorWeb(auth: string, guildId: string): Promise<boolean> {
    return (await fetch('/api/live', {
        headers: { Authorization: `${auth}` },
        body: JSON.stringify({
            guildId
        })
    })).ok
}