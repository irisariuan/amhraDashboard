"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const INVITE_LINK = process.env.NEXT_PUBLIC_INVITE_LINK

/** Sends the user into the Discord OAuth flow, or back to the dashboard if already logged in. */
export default function DiscordRedirect() {
	const router = useRouter()
	useEffect(() => {
		if (window.localStorage.getItem("bearer")) {
			router.push("/dashboard")
			return
		}
		router.push(INVITE_LINK ?? "/")
	}, [router])
	return null
}
