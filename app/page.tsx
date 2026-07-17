"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { getCurrentAccount } from "@/lib/api/auth"

export default function Home() {
	const router = useRouter()

	useEffect(() => {
		getCurrentAccount().then(account => {
			router.push(account ? "/dashboard" : "/login")
		})
	}, [router])

	return (
		<div className="w-full h-full flex flex-col items-center justify-center">
			<Link href="/login" className="text-white underline">
				Continue to Amhra
			</Link>
		</div>
	)
}
