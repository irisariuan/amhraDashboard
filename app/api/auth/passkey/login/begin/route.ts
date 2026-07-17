import { NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"

export async function POST() {
	const res = await botFetch("/auth/passkey/login/begin", { method: "POST" })
	return new NextResponse(await res.text(), {
		status: res.status,
		headers: { "content-type": "application/json" },
	})
}
