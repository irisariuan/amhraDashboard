import { type NextRequest, NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"

export async function POST(req: NextRequest) {
	const res = await botFetch("/auth/passkey/register/begin", {
		method: "POST",
		contentType: "application/json",
		body: await req.text(),
	})
	return new NextResponse(await res.text(), {
		status: res.status,
		headers: { "content-type": "application/json" },
	})
}
