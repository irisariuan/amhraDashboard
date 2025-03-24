"use client"
import Dashboard from "@/components/custom/dashboard"
import { login } from "@/lib/api/web"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function DashboardPage() {
	const [password, setPassword] = useState<string>()
	const [isBearer, setIsBearer] = useState<boolean>(false)
	const router = useRouter()
	const redirect = useCallback(async () => {
		if (window.location.hash) {
			const token = window.location.hash.slice(1)
			if (await login(token, { bearer: true })) {
				window.localStorage.setItem("bearer", token)
				console.log('init bearer')
				setIsBearer(true)
				setPassword(token)
				return router.replace("/dashboard")
			}
		}
		if (window.localStorage.getItem("bearer")) {
			if (!await login(window.localStorage.getItem("bearer") ?? "", { bearer: true })) {
				window.localStorage.removeItem("bearer")
				return router.push("/login")
			}
			setIsBearer(true)
			setPassword(window.localStorage.getItem("bearer") ?? "")
			console.log('using bearer')
			return
		}
		const item = window.localStorage.getItem("key")
		if (item && await login(item)) {
			setPassword(window.localStorage.getItem("key") ?? "")
			return
		}
		router.push("/login")
	}, [router])

	useEffect(() => {
		redirect()
	}, [redirect])
	return <>{password ? <Dashboard auth={password} bearer={isBearer} /> : <></>}</>
}
