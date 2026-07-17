import { NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { authHeaderFromCookies } from "@/lib/server/session"

export async function POST() {
	const res = await botFetch("/auth/passkey/add/begin", {
		method: "POST",
		auth: await authHeaderFromCookies(),
	})
	return new NextResponse(await res.text(), {
		status: res.status,
		headers: { "content-type": "application/json" },
	})
}
