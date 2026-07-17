import { NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { authHeaderFromCookies } from "@/lib/server/session"

export async function POST() {
	const res = await botFetch("/auth/discord/unlink", {
		method: "POST",
		auth: await authHeaderFromCookies(),
	})
	return new NextResponse(null, { status: res.status })
}
