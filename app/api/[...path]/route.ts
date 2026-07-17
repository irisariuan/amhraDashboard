import { type NextRequest, NextResponse } from "next/server"
import { botFetch } from "@/lib/server/bot"
import { authHeaderFromCookies } from "@/lib/server/session"

// Authenticated proxy for all non-auth bot endpoints (player, logs, settings,
// suggestions, …). Reads the session/anonymous token from httpOnly cookies and
// forwards it as an Authorization header so the browser never handles it.
async function proxy(req: NextRequest, path: string[]) {
	const auth = await authHeaderFromCookies()
	const search = req.nextUrl.search
	const isWrite = req.method === "POST"
	const res = await botFetch(`/${path.join("/")}${search}`, {
		method: req.method,
		auth,
		contentType: isWrite ? "application/json" : null,
		body: isWrite ? await req.text() : undefined,
	})
	const contentType = res.headers.get("content-type") ?? "application/json"
	const text = await res.text()
	return new NextResponse(text || null, {
		status: res.status,
		headers: { "content-type": contentType },
	})
}

export async function GET(
	req: NextRequest,
	ctx: { params: Promise<{ path: string[] }> },
) {
	return proxy(req, (await ctx.params).path)
}

export async function POST(
	req: NextRequest,
	ctx: { params: Promise<{ path: string[] }> },
) {
	return proxy(req, (await ctx.params).path)
}
