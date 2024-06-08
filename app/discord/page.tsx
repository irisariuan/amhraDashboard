'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DiscordRedirect() {
	const router = useRouter()
	useEffect(() => {
        if (window.localStorage.getItem("bearer")) {
            return router.push("/dashboard")
        }
        router.push("https://discord.com/oauth2/authorize?client_id=956459806691065856&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fregister&scope=identify+guilds")
	}, [])
    return <></>
}