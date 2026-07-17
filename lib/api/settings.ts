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

export interface AdminAction {
	action: "exit" | "reload" | "reloadSetting"
}

export async function postAction(action: AdminAction["action"]): Promise<boolean> {
	const res = await apiFetch("/api/action", { method: "POST", body: { action } })
	return res.ok
}
