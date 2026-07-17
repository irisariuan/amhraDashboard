import { type NextRequest, NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { authHeaderFromCookies } from "@/lib/server/session"

export async function POST(req: NextRequest) {
	const res = await botFetch("/auth/passkey/add/finish", {
		method: "POST",
		contentType: "application/json",
		auth: await authHeaderFromCookies(),
		body: await req.text(),
	})
	return new NextResponse(null, { status: res.status })
}
