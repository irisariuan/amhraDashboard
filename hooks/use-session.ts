"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { login } from "@/lib/api/auth"
import {
	type Session,
	clearBearerToken,
	readStoredSession,
	storeSession,
} from "@/lib/session"

/**
 * Resolves the dashboard session, in priority order:
 * 1. A bearer token delivered in the URL hash (Discord OAuth redirect)
 * 2. A stored bearer token
 * 3. A stored admin password
 * Redirects to /login when nothing validates.
 */
export function useSession(): Session | null {
	const [session, setSession] = useState<Session | null>(null)
	const router = useRouter()

	useEffect(() => {
		let cancelled = false

		async function resolve() {
			if (window.location.hash) {
				const candidate: Session = {
					type: "bearer",
					token: window.location.hash.slice(1),
				}
				if (await login(candidate)) {
					storeSession(candidate)
					if (cancelled) return
					setSession(candidate)
					router.replace("/dashboard")
					return
				}
			}
			const stored = readStoredSession()
			if (stored && (await login(stored))) {
				if (cancelled) return
				setSession(stored)
				return
			}
			if (stored?.type === "bearer") {
				clearBearerToken()
			}
			router.push("/login")
		}
		resolve()

		return () => {
			cancelled = true
		}
	}, [router])

	return session
}
