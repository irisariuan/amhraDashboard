"use client"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useSession } from "@/hooks/use-session"

export default function DashboardPage() {
	const session = useSession()
	return session ? <DashboardShell session={session} /> : null
}
