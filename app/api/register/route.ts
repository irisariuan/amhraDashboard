import { readFileSync } from "node:fs"
import { NextResponse } from "next/server"
import path from "node:path"

const settings = JSON.parse(readFileSync(path.join(process.cwd(), 'settings.json'), 'utf8'))

export const dynamic = 'force-dynamic'
export async function GET(req: Request) {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    if (!code) {
        return NextResponse.error()
    }
    const res = await fetch(`${settings.apiUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
    })
    if (!res.ok) {
        return NextResponse.error()
    }
    const { token } = await res.json()
    const redirectUrl = new URL('/dashboard', req.url)
    redirectUrl.hash = token
    return NextResponse.redirect(redirectUrl)
}