import { apiFetch } from "./client"

export interface AccountSettings {
	accountId: string
	autoSkip: boolean
	loop: boolean
	autoSuggest: boolean
	language: string
}

export async function getSettings(): Promise<AccountSettings | null> {
	const res = await apiFetch("/api/setting")
	if (!res.ok) return null
	return res.json()
}

export async function saveSettings(
	patch: Partial<Omit<AccountSettings, "accountId">>,
): Promise<boolean> {
	const res = await apiFetch("/api/setting", { method: "POST", body: patch })
	return res.ok
}

export interface GlobalSettings {
	PREFIX?: string
	CLIENT_ID: string
	REDIRECT_URI: string
	PRELOAD?: ("errim" | "error" | "errwn" | "express" | "main")[]
	RATE_LIMIT?: number
	DETAIL_LOGGING?: boolean
	QUEUE_SIZE?: number
	TEST_CLIENT_ID?: string
	PORT?: number
	WEBSITE?: string | null
	HTTPS?: boolean
	USE_YOUTUBE_DL?: boolean
	SEEK?: boolean
	VOLUME_MODIFIER?: number
	AUTO_LEAVE?: number
	USE_COOKIES?: boolean
	BANNED_IDS?: string[]
	MAX_CACHE_IN_GB?: number
	MESSAGE_LOGGING?: boolean
	VOICE_LOGGING?: boolean
}

export async function getAdminSettings(): Promise<GlobalSettings | null> {
	const res = await apiFetch("/api/admin/settings")
	if (!res.ok) return null
	return res.json()
}

export async function saveAdminSettings(
	settings: GlobalSettings,
): Promise<boolean> {
	const res = await apiFetch("/api/admin/settings", {
		method: "POST",
		body: settings,
	})
	return res.ok
}

export interface AdminAction {
	action: "exit" | "reload" | "reloadSetting"
}

export async function postAction(action: AdminAction["action"]): Promise<boolean> {
	const res = await apiFetch("/api/action", { method: "POST", body: { action } })
	return res.ok
}
