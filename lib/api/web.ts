import { Log } from "./log"

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
    console.log(auth, req.status)
    return req.ok
}

interface ActionData {
    action: 'exit'
}

export function postAction(auth: string, data: ActionData) {
    return fetch('/api/action', {
        headers: { Authorization: `Basic ${auth}` },
        method: 'POST',
        body: JSON.stringify(data)
    })
}

export async function getLog(auth: string): Promise<{ content: Log[] | null }> {
    const req = await fetch('/api/log', {
        headers: { Authorization: `Basic ${auth}` }
    })
    if (!req.ok) {
        return { content: null }
    }
    return await req.json()
}