"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { login } from "@/lib/api/auth"

export default function Home() {
	const router = useRouter()

	useEffect(() => {
		let cancelled = false
		async function redirect() {
			const key = window.localStorage.getItem("key")
			if (key && (await login({ type: "admin", token: key }))) {
				if (!cancelled) router.push("/dashboard")
				return
			}
			if (!cancelled) router.push("/login")
		}
		redirect()
		return () => {
			cancelled = true
		}
	}, [router])

	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<Link href="/login" className="text-white underline">
				Click here to redirect to login page
			</Link>
		</div>
	)
}
