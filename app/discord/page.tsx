'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DiscordRedirect() {
	const router = useRouter()
	useEffect(() => {
        if (window.localStorage.getItem("bearer")) {
            return router.push("/dashboard")
        }
        router.push(process.env.INVITE_LINK ?? '/')
	}, [])
    return <></>
}