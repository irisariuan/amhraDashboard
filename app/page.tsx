"use client"
import { login } from "@/lib/api/web"
import Link from "next/link"
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
	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<Link href="/login" className="text-white underline">
				Click here to redirect to login page
			</Link>
		</div>
	)
}
