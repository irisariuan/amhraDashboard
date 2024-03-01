export async function login(auth: string): Promise<boolean> {
    const req = await fetch('/api/new', {
        headers: { Authorization: `Basic ${auth}` }
    })
    console.log(auth, req.status)
    return req.ok
}
export async function logout(auth: string): Promise<boolean> {
    const req = await fetch('/api/logout', {
        headers: { Authorization: `Basic ${auth}` }
    })
    console.log(auth, req.status)
    return req.ok
}

export async function closeBot(auth:string) {
    //todo
}