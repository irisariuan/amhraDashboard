"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	getAdminSettings,
	postAction,
	saveAdminSettings,
	type GlobalSettings,
} from "@/lib/api/settings"

const PRELOAD_LOGS = ["errim", "error", "errwn", "express", "main"] as const

type TextSetting =
	| "PREFIX"
	| "CLIENT_ID"
	| "REDIRECT_URI"
	| "TEST_CLIENT_ID"
	| "WEBSITE"
type NumberSetting =
	| "RATE_LIMIT"
	| "QUEUE_SIZE"
	| "PORT"
	| "VOLUME_MODIFIER"
	| "AUTO_LEAVE"
	| "MAX_CACHE_IN_GB"
type BooleanSetting =
	| "DETAIL_LOGGING"
	| "HTTPS"
	| "USE_YOUTUBE_DL"
	| "SEEK"
	| "USE_COOKIES"
	| "MESSAGE_LOGGING"
	| "VOICE_LOGGING"

function SettingSection({
	title,
	description,
	children,
}: {
	title: string
	description: string
	children: React.ReactNode
}) {
	return (
		<section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
			<div className="mb-5">
				<h3 className="text-base font-semibold text-zinc-100">{title}</h3>
				<p className="mt-1 text-sm text-zinc-400">{description}</p>
			</div>
			<div className="grid gap-4 md:grid-cols-2">{children}</div>
		</section>
	)
}

function TextSettingField({
	settings,
	settingKey,
	label,
	description,
	onChange,
}: {
	settings: GlobalSettings
	settingKey: TextSetting
	label: string
	description?: string
	onChange: (key: TextSetting, value: string) => void
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={settingKey}>{label}</Label>
			<Input
				id={settingKey}
				type="text"
				value={settings[settingKey] ?? ""}
				onChange={event => onChange(settingKey, event.target.value)}
			/>
			{description && <p className="text-xs text-zinc-500">{description}</p>}
		</div>
	)
}

function NumberSettingField({
	settings,
	settingKey,
	label,
	description,
	onChange,
}: {
	settings: GlobalSettings
	settingKey: NumberSetting
	label: string
	description?: string
	onChange: (key: NumberSetting, value: number) => void
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={settingKey}>{label}</Label>
			<Input
				id={settingKey}
				type="number"
				value={settings[settingKey] ?? ""}
				onChange={event => {
					const value = Number(event.target.value)
					if (event.target.value !== "" && Number.isFinite(value)) {
						onChange(settingKey, value)
					}
				}}
			/>
			{description && <p className="text-xs text-zinc-500">{description}</p>}
		</div>
	)
}

function BooleanSettingField({
	settings,
	settingKey,
	label,
	description,
	onChange,
}: {
	settings: GlobalSettings
	settingKey: BooleanSetting
	label: string
	description?: string
	onChange: (key: BooleanSetting, value: boolean) => void
}) {
	return (
		<label className="flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/[0.03]">
			<input
				type="checkbox"
				className="mt-0.5 h-4 w-4 accent-violet-500"
				checked={Boolean(settings[settingKey])}
				onChange={event => onChange(settingKey, event.target.checked)}
			/>
			<span>
				<span className="block text-sm font-medium text-zinc-100">{label}</span>
				{description && <span className="mt-1 block text-xs text-zinc-500">{description}</span>}
			</span>
		</label>
	)
}

/** Global bot settings and operational controls, restricted to administrators. */
export function AdministrationView() {
	const { data, isLoading, mutate } = useSWR(
		"/api/admin/settings",
		getAdminSettings,
	)
	const [settings, setSettings] = useState<GlobalSettings | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		if (data) setSettings(data)
	}, [data])

	function update<K extends keyof GlobalSettings>(
		key: K,
		value: GlobalSettings[K],
	) {
		setSettings(current =>
			current ? Object.assign({}, current, { [key]: value }) : current,
		)
	}

	async function save() {
		if (!settings) return
		setIsSaving(true)
		const saved = await saveAdminSettings(settings)
		setIsSaving(false)
		if (saved) {
			toast("Global settings saved and reloaded")
			mutate()
		} else {
			toast("Failed to save global settings")
		}
	}

	if (isLoading || !settings) {
		return <div className="text-sm text-zinc-500">Loading administration…</div>
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6 pb-8">
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
				<div>
					<p className="text-sm font-medium text-violet-300">Administrator only</p>
					<h2 className="mt-1 text-3xl font-bold tracking-tight">Administration</h2>
					<p className="mt-2 max-w-2xl text-sm text-zinc-400">
						Manage the bot&apos;s runtime configuration and operational controls.
						Changes are written to <code>data/setting.json</code> and reloaded immediately.
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => data && setSettings(data)}>
						Discard changes
					</Button>
					<Button onClick={save} disabled={isSaving}>
						{isSaving ? "Saving…" : "Save settings"}
					</Button>
				</div>
			</div>

			<SettingSection title="Server" description="Connection, command, and Discord application behavior.">
				<TextSettingField settings={settings} settingKey="PREFIX" label="Command prefix" onChange={update} />
				<TextSettingField settings={settings} settingKey="CLIENT_ID" label="Client ID" onChange={update} />
				<TextSettingField settings={settings} settingKey="TEST_CLIENT_ID" label="Testing client ID" onChange={update} />
				<TextSettingField settings={settings} settingKey="REDIRECT_URI" label="OAuth redirect URI" onChange={update} />
				<TextSettingField settings={settings} settingKey="WEBSITE" label="Website host" description="Host name without the protocol." onChange={update} />
				<NumberSettingField settings={settings} settingKey="PORT" label="Port" onChange={update} />
				<NumberSettingField settings={settings} settingKey="RATE_LIMIT" label="Rate limit" description="Requests per five minutes; 0 disables it." onChange={update} />
				<NumberSettingField settings={settings} settingKey="QUEUE_SIZE" label="Log queue size" description="0 or less keeps all in-memory logs." onChange={update} />
				<BooleanSettingField settings={settings} settingKey="HTTPS" label="Use HTTPS" description="Build dashboard links with https." onChange={update} />
			</SettingSection>

			<SettingSection title="Playback" description="Audio streaming, cache, and access behavior.">
				<NumberSettingField settings={settings} settingKey="VOLUME_MODIFIER" label="Volume modifier" onChange={update} />
				<NumberSettingField settings={settings} settingKey="AUTO_LEAVE" label="Auto-leave delay (ms)" onChange={update} />
				<NumberSettingField settings={settings} settingKey="MAX_CACHE_IN_GB" label="Maximum cache (GB)" onChange={update} />
				<div className="space-y-1.5">
					<Label htmlFor="BANNED_IDS">Banned IDs</Label>
					<Input id="BANNED_IDS" value={(settings.BANNED_IDS ?? []).join(", ")} onChange={event => update("BANNED_IDS", event.target.value.split(/[,\n]/).map(value => value.trim()).filter(Boolean))} placeholder="Comma-separated Discord IDs" />
				</div>
				<BooleanSettingField settings={settings} settingKey="USE_YOUTUBE_DL" label="Use yt-dlp" description="Use yt-dlp instead of the Node audio stream." onChange={update} />
				<BooleanSettingField settings={settings} settingKey="SEEK" label="Enable seeking" description="Disable when using youtube-dl." onChange={update} />
				<BooleanSettingField settings={settings} settingKey="USE_COOKIES" label="Use cookies" description="Use cookies while fetching media." onChange={update} />
			</SettingSection>

			<SettingSection title="Logging" description="Choose startup logs and diagnostic output.">
				<div className="space-y-2 md:col-span-2">
					<Label>Preload log files</Label>
					<div className="flex flex-wrap gap-2">
						{PRELOAD_LOGS.map(log => {
							const selected = settings.PRELOAD?.includes(log) ?? false
							return <label key={log} className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm capitalize hover:bg-white/[0.03]"><input type="checkbox" className="h-4 w-4 accent-violet-500" checked={selected} onChange={event => update("PRELOAD", event.target.checked ? [...(settings.PRELOAD ?? []), log] : (settings.PRELOAD ?? []).filter(value => value !== log))} />{log}</label>
						})}
					</div>
				</div>
				<BooleanSettingField settings={settings} settingKey="DETAIL_LOGGING" label="Detailed logging" description="Record diagnostic API requests." onChange={update} />
				<BooleanSettingField settings={settings} settingKey="MESSAGE_LOGGING" label="Message logging" description="Enable message logging where supported." onChange={update} />
				<BooleanSettingField settings={settings} settingKey="VOICE_LOGGING" label="Voice logging" description="Enable voice-state logging where supported." onChange={update} />
			</SettingSection>

			<SettingSection title="Operations" description="Run administrative actions on the bot process.">
				<div className="flex flex-wrap gap-3 md:col-span-2">
					<Button variant="secondary" onClick={async () => toast((await postAction("reload")) ? "Commands reloaded" : "Failed to reload commands")}>Reload commands</Button>
					<Button variant="secondary" onClick={async () => toast((await postAction("reloadSetting")) ? "Settings reloaded" : "Failed to reload settings")}>Reload settings</Button>
					<Dialog>
						<DialogTrigger asChild><Button variant="destructive">Terminate bot</Button></DialogTrigger>
						<DialogContent>
							<DialogHeader><DialogTitle>Terminate the bot?</DialogTitle><DialogDescription>This immediately stops the bot for every guild.</DialogDescription></DialogHeader>
							<DialogFooter className="gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><DialogClose asChild><Button variant="destructive" onClick={() => postAction("exit")}>Terminate</Button></DialogClose></DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</SettingSection>
		</div>
	)
}
