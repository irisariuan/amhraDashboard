import { NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { authHeaderFromCookies } from "@/lib/server/session"

export async function GET() {
	const auth = await authHeaderFromCookies()
	if (!auth) return new NextResponse(null, { status: 401 })
	const res = await botFetch("/auth/session", { auth })
	return new NextResponse(await res.text(), {
		status: res.status,
		headers: { "content-type": "application/json" },
	})
}
