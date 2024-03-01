"use client"
import Dashboard from "@/components/custom/dashboard"
import { login } from "@/lib/api/web"
import { useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

export default function DashboardPage() {
	const [password, setPassword] = useState<string>()
	const router = useRouter()
	const redirect = async () => {
		const item = window.localStorage.getItem("key")
		if (item && (await login(item))) return
		router.push("/login")
	}
	useEffect(() => {
		redirect()
		setPassword(window.localStorage.getItem("key") ?? '')
	}, [])
	return <>{password ? <Dashboard auth={password} /> : <></>}</>
}
