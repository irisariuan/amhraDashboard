import type { Channel, Guild, Log } from "./log"
import { SongEditType } from "./song"

interface LoginOptions {
    bearer?: boolean
}

export async function login(auth: string, settings?: LoginOptions): Promise<boolean> {
    const req = await fetch('/api/new', {
        headers: { Authorization: `${settings?.bearer ? 'Bearer' : 'Basic'} ${auth}` }
    })
    return req.ok
}
export async function logout(auth: string): Promise<boolean> {
    const req = await fetch('/api/logout', {
        headers: { Authorization: `Basic ${auth}` }
    })
    return req.ok
}

export enum ActionType {
    Exit = 'exit',
    AddAuth = 'addAuth',
    ReloadCommands = 'reload',
    ReloadSetting = 'reloadSetting'
}

export interface ActionData {
    action: ActionType
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

export interface AuthData {
    guildId: string,
    visitor: boolean,
    bearer: boolean,
    auth: string
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
    }).reverse()
    return { content }
}

export async function editAction(action: SongEditType.SetQueue, authData: AuthData, queue: string[]): Promise<boolean>
export async function editAction(action: SongEditType.SetVolume, authData: AuthData, volume: number): Promise<boolean>
export async function editAction(action: SongEditType.RemoveSong, authData: AuthData, index: number): Promise<boolean>
export async function editAction(action: SongEditType.SetTime, authData: AuthData, time: number): Promise<boolean>
export async function editAction(action: SongEditType.AddSong, authData: AuthData, url: string): Promise<boolean>
export async function editAction(action: SongEditType, authData: AuthData): Promise<boolean>
export async function editAction(action: SongEditType, authData: AuthData, data?: number | string | string[]): Promise<boolean> {
    const headerAuth = authData.visitor ? authData.auth : `${authData.bearer ? 'Bearer' : 'Basic'} ${authData.auth}`
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
                    guildId: authData.guildId,
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
                    guildId: authData.guildId,
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
                    guildId: authData.guildId,
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
                    guildId: authData.guildId,
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
                    guildId: authData.guildId,
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
                    guildId: authData.guildId,
                })
            })
            return req.ok
        }
    }
}
//{ url: string, title: string, durationInSec: number }
export async function queryYoutube(query: string, authData: Omit<AuthData, 'guildId'>): Promise<Pick<YoutubeVideoData, 'url' | 'title' | 'durationInSec'>> {
    return await (await fetch('/api/search', {
        method: 'POST',
        headers: {
            Authorization: authData.visitor ? authData.auth : `${authData.bearer ? 'Bearer' : 'Basic'} ${authData.auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query
        })
    })).json()
}

export async function queryDetails(url: string, authData: Omit<AuthData, 'guildId'>): Promise<YoutubeVideoData> {
    return await (await fetch('/api/getVideoDetail', {
        method: 'POST',
        headers: {
            Authorization: authData.visitor ? authData.auth : `${authData.bearer ? 'Bearer' : 'Basic'} ${authData.auth}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            url
        }),
        cache: 'force-cache'
    })).json()
}

export async function getMessages(authData: Pick<AuthData, 'auth' | 'guildId'>) {
    const { content }: { content: Channel[] } = await (await fetch(`/api/messages/${authData.guildId}`, {
        headers: { Authorization: `Basic ${authData.auth}` }
    })).json() ?? { content: [] }
    return content
}

export async function getAllGuilds(auth: string): Promise<Guild[]> {
    return (await (await fetch('/api/guildIds/all', {
        headers: { Authorization: `Basic ${auth}` }
    })).json()).content ?? []
}

export async function verifyVisitorWeb(authData: Pick<AuthData, 'auth' | 'guildId'>): Promise<boolean> {
    const req = await fetch('/api/live', {
        method: 'POST',
        headers: { Authorization: `${authData.auth}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            guildId: authData.guildId
        })
    })
    return req.ok
}