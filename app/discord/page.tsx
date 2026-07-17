"use client"
import { useEffect } from "react"

const INVITE_LINK = process.env.NEXT_PUBLIC_INVITE_LINK

/** Kicks off the Discord OAuth flow (login or account linking). */
export default function DiscordRedirect() {
	useEffect(() => {
		window.location.href = INVITE_LINK ?? "/"
	}, [])
	return null
}
