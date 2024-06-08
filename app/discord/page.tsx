'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const INVITE_LINK = process.env.NEXT_PUBLIC_INVITE_LINK

export default function DiscordRedirect() {
	const router = useRouter()
	useEffect(() => {
        if (window.localStorage.getItem("bearer")) {
            return router.push("/dashboard")
        }
        router.push(INVITE_LINK ?? '/')
        }, [])
    console.log(INVITE_LINK)
    return <></>
}