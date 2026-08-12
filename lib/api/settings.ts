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
	MAX_REPLAY_BUFFER_IN_SEC?: number
	MAX_STREAM_BUFFER_IN_MB?: number
	MESSAGE_LOGGING?: boolean
	VOICE_LOGGING?: boolean
	/**
	 * Settings this build of the dashboard does not name. The form is generated
	 * from the bot's schema, so it can legitimately be newer than these types;
	 * unknown keys still round-trip through save.
	 */
	[key: string]: unknown
}

export async function getAdminSettings(): Promise<GlobalSettings | null> {
	const res = await apiFetch("/api/admin/settings")
	if (!res.ok) return null
	return res.json()
}

/** One entry of the settings JSON Schema, as far as the form builder cares. */
export interface SettingProperty {
	type?: "string" | "number" | "integer" | "boolean" | "array"
	description?: string
	items?: { type?: string; enum?: string[] }
	enum?: string[]
	minimum?: number
	maximum?: number
	exclusiveMinimum?: number
	exclusiveMaximum?: number
}

export interface SettingSchema {
	properties: Record<string, SettingProperty>
	required?: string[]
}

/**
 * The schema the bot validates settings against, with secrets removed.
 *
 * The administration form is generated from this, so a setting added to the bot
 * appears here without the dashboard needing a matching release.
 */
export async function getAdminSettingsSchema(): Promise<SettingSchema | null> {
	const res = await apiFetch("/api/admin/settings/schema")
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
