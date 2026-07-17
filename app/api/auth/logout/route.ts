import { NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { authHeaderFromCookies, clearAuthCookies } from "@/lib/server/session"

export async function POST() {
	const auth = await authHeaderFromCookies()
	if (auth?.startsWith("Session ")) {
		await botFetch("/auth/logout", { method: "POST", auth }).catch(() => {})
	}
	await clearAuthCookies()
	return NextResponse.json({ ok: true })
}
