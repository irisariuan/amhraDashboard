"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Spinner } from "@/components/shared/spinner"
import { useAccount } from "@/hooks/use-account"

export default function DashboardPage() {
	const { account, isLoading } = useAccount()
	const router = useRouter()

	useEffect(() => {
		if (!isLoading && !account) router.replace("/login")
	}, [isLoading, account, router])

	if (isLoading || !account) {
		return (
			<div className="grid place-items-center h-full">
				<Spinner />
			</div>
		)
	}
	return <DashboardShell account={account} />
}
