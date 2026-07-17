import { type NextRequest, NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { setAnonCookie } from "@/lib/server/session"

// Validates an anonymous (visitor) token against the bot for its guild and, if
// valid, stores it as an httpOnly cookie so the proxy can use it thereafter.
export async function POST(req: NextRequest) {
	const { token, guildId } = await req.json()
	if (!token || !guildId) return new NextResponse(null, { status: 400 })
	const res = await botFetch("/live", {
		method: "POST",
		auth: `Anon ${token}`,
		contentType: "application/json",
		body: JSON.stringify({ guildId }),
	})
	if (!res.ok) return new NextResponse(null, { status: res.status })
	await setAnonCookie(token)
	return NextResponse.json({ ok: true })
}
