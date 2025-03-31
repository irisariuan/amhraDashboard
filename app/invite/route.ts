import { type NextRequest, NextResponse } from "next/server"

export function GET(req: NextRequest) {
    if (process.env.INVITE_LINK) {
        return NextResponse.redirect(process.env.INVITE_LINK)
    }
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL))
}