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

export interface YoutubeVideoData {
    durationInSec: number,
    channel: {
        url: string,
        id: string,
        name: string
    },
    id: string,
    title: string,
    views: number,
    url: string
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

export async function editAction(auth: string, action: SongEditType.SetQueue, guildId: string, visitor: boolean, queue: string[]): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.SetVolume, guildId: string, visitor: boolean, volume: number): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.RemoveSong, guildId: string, visitor: boolean, index: number): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.SetTime, guildId: string, visitor: boolean, time: number): Promise<boolean>
export async function editAction(auth: string, action: SongEditType.AddSong, guildId: string, visitor: boolean, url: string): Promise<boolean>
export async function editAction(auth: string, action: SongEditType, guildId: string, visitor: boolean): Promise<boolean>
export async function editAction(auth: string, action: SongEditType, guildId: string, visitor: boolean, data?: number | string | string[]): Promise<boolean> {
    const headerAuth = visitor ? auth : `Basic ${auth}`
    switch (action) {
        case SongEditType.AddSong: {
            const req = await fetch('/api/song/edit', {
                method: 'POST',
                headers: {
                    Authorization: headerAuth,
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
                    Authorization: headerAuth,
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
                    Authorization: headerAuth,
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
                    Authorization: headerAuth,
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
                    Authorization: headerAuth,
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
                    Authorization: headerAuth,
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
//{ url: string, title: string, durationInSec: number }
export async function queryYoutube(auth: string, query: string, visitor: boolean): Promise<Pick<YoutubeVideoData, 'url' | 'title' | 'durationInSec'>> {
    return await (await fetch('/api/search', {
        method: 'POST',
        headers: {
            Authorization: visitor ? auth : `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query
        })
    })).json()
}

export async function queryDetails(auth: string, url: string, visitor: boolean): Promise<YoutubeVideoData> {
    return await (await fetch('/api/getVideoDetail', {
        method: 'POST',
        headers: {
            Authorization: visitor ? auth : `Basic ${auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url
        }),
        cache: 'force-cache'
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
    const req = await fetch('/api/live', {
        method: 'POST',
        headers: { Authorization: `${auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            guildId
        })
    })
    return req.ok
}