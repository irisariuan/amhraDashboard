import { type NextRequest, NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { authHeaderFromCookies, setSessionCookie } from "@/lib/server/session"

export const dynamic = "force-dynamic"

// Discord OAuth redirect target. Exchanges the code via the bot: if a session
// cookie is already present the Discord identity is linked to that account,
// otherwise it logs into (or creates) the linked account. Either way a session
// cookie is set and the user lands on the dashboard.
export async function GET(req: NextRequest) {
	const code = req.nextUrl.searchParams.get("code")
	const home = new URL("/", process.env.NEXT_PUBLIC_URL)
	if (!code) return NextResponse.redirect(home)

	const res = await botFetch("/auth/discord/callback", {
		method: "POST",
		contentType: "application/json",
		auth: await authHeaderFromCookies(),
		body: JSON.stringify({ code }),
	})
	if (!res.ok) return NextResponse.redirect(home)

	const { token } = await res.json()
	await setSessionCookie(token)
	return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_URL))
}
