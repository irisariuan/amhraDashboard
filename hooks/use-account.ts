"use client"
import useSWR from "swr"
import { getCurrentAccount } from "@/lib/api/auth"
import type { Account } from "@/lib/api/types"

/** The current signed-in account (via httpOnly session cookie), or null. */
export function useAccount() {
	const { data, isLoading, mutate } = useSWR<Account | null>(
		"/api/auth/session",
		getCurrentAccount,
		{ shouldRetryOnError: false },
	)
	return { account: data ?? null, isLoading, mutate }
}
