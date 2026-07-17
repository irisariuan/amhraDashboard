import { type NextRequest, NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { setSessionCookie } from "@/lib/server/session"

export async function POST(req: NextRequest) {
	const res = await botFetch("/auth/passkey/register/finish", {
		method: "POST",
		contentType: "application/json",
		body: await req.text(),
	})
	if (!res.ok) return new NextResponse(null, { status: res.status })
	const { token } = await res.json()
	await setSessionCookie(token)
	return NextResponse.json({ ok: true })
}
