import {
	startAuthentication,
	startRegistration,
} from "@simplewebauthn/browser"
import { apiFetch } from "./client"
import type { Account } from "./types"

/** Current signed-in account, or null if unauthenticated. */
export async function getCurrentAccount(): Promise<Account | null> {
	const res = await apiFetch("/api/auth/session")
	if (!res.ok) return null
	const { account }: { account: Account } = await res.json()
	return account
}

/**
 * Registers a new web account with a passkey. Runs the WebAuthn ceremony in the
 * browser and, on success, the server sets the session cookie.
 */
export async function registerPasskey(displayName?: string): Promise<boolean> {
	const beginRes = await apiFetch("/api/auth/passkey/register/begin", {
		method: "POST",
		body: { displayName },
	})
	if (!beginRes.ok) return false
	const { challengeId, options } = await beginRes.json()
	const attestation = await startRegistration({ optionsJSON: options })
	const finishRes = await apiFetch("/api/auth/passkey/register/finish", {
		method: "POST",
		body: { challengeId, response: attestation },
	})
	return finishRes.ok
}

/** Signs in with an existing passkey (usernameless). */
export async function loginPasskey(): Promise<boolean> {
	const beginRes = await apiFetch("/api/auth/passkey/login/begin", {
		method: "POST",
	})
	if (!beginRes.ok) return false
	const { challengeId, options } = await beginRes.json()
	const assertion = await startAuthentication({ optionsJSON: options })
	const finishRes = await apiFetch("/api/auth/passkey/login/finish", {
		method: "POST",
		body: { challengeId, response: assertion },
	})
	return finishRes.ok
}

/** Adds another passkey to the current account. */
export async function addPasskey(): Promise<boolean> {
	const beginRes = await apiFetch("/api/auth/passkey/add/begin", {
		method: "POST",
	})
	if (!beginRes.ok) return false
	const { challengeId, options } = await beginRes.json()
	const attestation = await startRegistration({ optionsJSON: options })
	const finishRes = await apiFetch("/api/auth/passkey/add/finish", {
		method: "POST",
		body: { challengeId, response: attestation },
	})
	return finishRes.ok
}

export async function logout(): Promise<void> {
	await apiFetch("/api/auth/logout", { method: "POST" })
}

export async function unlinkDiscord(): Promise<boolean> {
	const res = await apiFetch("/api/auth/discord/unlink", { method: "POST" })
	return res.ok
}

/** Validates a visitor token for a guild and stores it as the anon session. */
export async function loginAnonymous(
	token: string,
	guildId: string,
): Promise<boolean> {
	const res = await apiFetch("/api/auth/anon", {
		method: "POST",
		body: { token, guildId },
	})
	return res.ok
}
