"use client"
import useSWR from "swr"
import { getLogs } from "@/lib/api/logs"
import type { Session } from "@/lib/session"

/** Server logs, polled every 3 s. */
export function useLogs(session: Session) {
	const { data, isLoading, error } = useSWR(
		"/api/log",
		() => getLogs(session),
		{ refreshInterval: 3000 },
	)
	return { data, isLoading, error }
}
