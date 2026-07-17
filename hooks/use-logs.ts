"use client"
import useSWR from "swr"
import { getLogs } from "@/lib/api/logs"

/** Server logs (admin only), polled every 3 s. */
export function useLogs(enabled: boolean) {
	const { data, isLoading, error } = useSWR(
		enabled ? "/api/log" : null,
		getLogs,
		{ refreshInterval: 3000 },
	)
	return { data, isLoading, error }
}
