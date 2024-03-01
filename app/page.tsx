"use client"
import { login } from "@/lib/api/web"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Home() {
    const router = useRouter()
	const redirect = async () => {
		const item = window.localStorage.getItem("key")
		if (item) {
			if (await login(item)) {
				return router.push("/dashboard")
			}
		}
		return router.push("/login")
	}
	useEffect(() => {
		redirect()
	}, [])
	return <div></div>
}