"use client"

import { useEffect, useMemo, useState } from "react"
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	getAdminSettings,
	getAdminSettingsSchema,
	postAction,
	saveAdminSettings,
	type GlobalSettings,
	type SettingProperty,
	type SettingSchema,
} from "@/lib/api/settings"

/**
 * Which section a setting belongs to, and what to call it.
 *
 * Only presentation lives here. Types, ranges, and help text come from the
 * schema the bot serves, so a setting added to the bot renders correctly
 * without a dashboard release. Anything not listed lands in "Other settings"
 * rather than disappearing.
 */
const GROUPS: { title: string; description: string; keys: string[] }[] = [
	{
		title: "Server",
		description: "Connection, command, and Discord application behavior.",
		keys: [
			"PREFIX",
			"CLIENT_ID",
			"TEST_CLIENT_ID",
			"REDIRECT_URI",
			"WEBSITE",
			"PORT",
			"RATE_LIMIT",
			"QUEUE_SIZE",
			"HTTPS",
		],
	},
	{
		title: "Playback",
		description: "Audio streaming, buffering, cache, and access behavior.",
		keys: [
			"VOLUME_MODIFIER",
			"AUTO_LEAVE",
			"MAX_CACHE_IN_GB",
			"MAX_REPLAY_BUFFER_IN_SEC",
			"MAX_STREAM_BUFFER_IN_MB",
			"BANNED_IDS",
			"USE_YOUTUBE_DL",
			"SEEK",
			"USE_COOKIES",
		],
	},
	{
		title: "Logging",
		description: "Choose startup logs and diagnostic output.",
		keys: ["PRELOAD", "DETAIL_LOGGING", "MESSAGE_LOGGING", "VOICE_LOGGING"],
	},
]

const LABELS: Record<string, string> = {
	PREFIX: "Command prefix",
	CLIENT_ID: "Client ID",
	TEST_CLIENT_ID: "Testing client ID",
	REDIRECT_URI: "OAuth redirect URI",
	WEBSITE: "Website host",
	PORT: "Port",
	RATE_LIMIT: "Rate limit",
	QUEUE_SIZE: "Log queue size",
	HTTPS: "Use HTTPS",
	VOLUME_MODIFIER: "Volume modifier",
	AUTO_LEAVE: "Auto-leave delay (ms)",
	MAX_CACHE_IN_GB: "Maximum cache (GB)",
	MAX_REPLAY_BUFFER_IN_SEC: "Replay buffer (seconds)",
	MAX_STREAM_BUFFER_IN_MB: "Stream buffer (MB)",
	BANNED_IDS: "Banned IDs",
	USE_YOUTUBE_DL: "Use yt-dlp",
	SEEK: "Enable seeking",
	USE_COOKIES: "Use cookies",
	PRELOAD: "Preload log files",
	DETAIL_LOGGING: "Detailed logging",
	MESSAGE_LOGGING: "Message logging",
	VOICE_LOGGING: "Voice logging",
}

/**
 * Words kept uppercase when a key is turned into a label. Matched explicitly
 * rather than by length, so units and acronyms are capitalised without also
 * shouting short ordinary words like "in" or "of".
 */
const ACRONYMS = new Set([
	"ID", "URI", "URL", "API", "IP", "TTL", "UI", "CPU", "RAM", "DL",
	"MS", "KB", "MB", "GB", "TB", "HTTP", "HTTPS",
])

/** MAX_STREAM_BUFFER_IN_MB -> "Max stream buffer in MB", for unlabelled settings */
function humanize(key: string) {
	const words = key
		.toLowerCase()
		.split("_")
		.map(word => (ACRONYMS.has(word.toUpperCase()) ? word.toUpperCase() : word))
	const [first, ...rest] = words
	return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(" ")
}

function labelFor(key: string) {
	return LABELS[key] ?? humanize(key)
}

function isBoolean(property: SettingProperty) {
	return property.type === "boolean"
}

/** Human-readable bounds, since a number input cannot express exclusivity */
function rangeHint(property: SettingProperty) {
	const parts: string[] = []
	if (property.minimum !== undefined) parts.push(`at least ${property.minimum}`)
	if (property.exclusiveMinimum !== undefined)
		parts.push(`greater than ${property.exclusiveMinimum}`)
	if (property.maximum !== undefined) parts.push(`at most ${property.maximum}`)
	if (property.exclusiveMaximum !== undefined)
		parts.push(`less than ${property.exclusiveMaximum}`)
	return parts.length ? `Must be ${parts.join(", ")}.` : null
}

/**
 * Check a value against the schema before saving.
 *
 * The bot rejects out-of-range values with a 400 covering the whole request, so
 * without this one bad field fails the save with nothing pointing at which.
 */
function validate(
	key: string,
	property: SettingProperty,
	value: unknown,
	required: boolean,
): string | null {
	if (value === undefined || value === "" || value === null) {
		return required ? `${labelFor(key)} is required.` : null
	}
	if (property.type === "number" || property.type === "integer") {
		const n = Number(value)
		if (!Number.isFinite(n)) return "Must be a number."
		if (property.type === "integer" && !Number.isInteger(n))
			return "Must be a whole number."
		if (property.minimum !== undefined && n < property.minimum)
			return `Must be at least ${property.minimum}.`
		if (property.exclusiveMinimum !== undefined && n <= property.exclusiveMinimum)
			return `Must be greater than ${property.exclusiveMinimum}.`
		if (property.maximum !== undefined && n > property.maximum)
			return `Must be at most ${property.maximum}.`
		if (property.exclusiveMaximum !== undefined && n >= property.exclusiveMaximum)
			return `Must be less than ${property.exclusiveMaximum}.`
	}
	return null
}

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

function FieldShell({
	settingKey,
	required,
	error,
	hint,
	children,
	wide,
}: {
	settingKey: string
	required: boolean
	error?: string | null
	hint?: string | null
	children: React.ReactNode
	wide?: boolean
}) {
	return (
		<div className={`space-y-1.5${wide ? " md:col-span-2" : ""}`}>
			<Label htmlFor={settingKey}>
				{labelFor(settingKey)}
				{required && <span className="ml-1 text-violet-300">*</span>}
			</Label>
			{children}
			{error ? (
				<p className="text-xs text-red-400">{error}</p>
			) : (
				hint && <p className="text-xs text-zinc-500">{hint}</p>
			)}
		</div>
	)
}

/** Renders whichever input the schema entry calls for. */
function SettingField({
	settingKey,
	property,
	value,
	required,
	error,
	onChange,
}: {
	settingKey: string
	property: SettingProperty
	value: unknown
	required: boolean
	error?: string | null
	onChange: (key: string, value: unknown) => void
}) {
	const hint = [property.description, rangeHint(property)]
		.filter(Boolean)
		.join(" ")

	if (isBoolean(property)) {
		return (
			<label className="flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/[0.03]">
				<input
					type="checkbox"
					className="mt-0.5 h-4 w-4 accent-violet-500"
					checked={Boolean(value)}
					onChange={event => onChange(settingKey, event.target.checked)}
				/>
				<span>
					<span className="block text-sm font-medium text-zinc-100">
						{labelFor(settingKey)}
					</span>
					{hint && (
						<span className="mt-1 block text-xs text-zinc-500">{hint}</span>
					)}
				</span>
			</label>
		)
	}

	// A single choice from a fixed set
	if (property.enum) {
		return (
			<FieldShell settingKey={settingKey} required={required} error={error} hint={hint}>
				<Select
					value={value === undefined || value === null ? "" : String(value)}
					onValueChange={next => onChange(settingKey, next)}
				>
					<SelectTrigger id={settingKey}>
						<SelectValue placeholder="Select…" />
					</SelectTrigger>
					<SelectContent>
						{property.enum.map(option => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FieldShell>
		)
	}

	// An array of fixed options: PRELOAD and anything later shaped like it
	if (property.type === "array" && property.items?.enum) {
		const selected = Array.isArray(value) ? (value as string[]) : []
		return (
			<div className="space-y-2 md:col-span-2">
				<Label>{labelFor(settingKey)}</Label>
				<div className="flex flex-wrap gap-2">
					{property.items.enum.map(option => (
						<label
							key={option}
							className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm capitalize hover:bg-white/[0.03]"
						>
							<input
								type="checkbox"
								className="h-4 w-4 accent-violet-500"
								checked={selected.includes(option)}
								onChange={event =>
									onChange(
										settingKey,
										event.target.checked
											? [...selected, option]
											: selected.filter(v => v !== option),
									)
								}
							/>
							{option}
						</label>
					))}
				</div>
				{hint && <p className="text-xs text-zinc-500">{hint}</p>}
			</div>
		)
	}

	// A free-form list: edited as comma-separated text
	if (property.type === "array") {
		const list = Array.isArray(value) ? (value as string[]) : []
		return (
			<FieldShell settingKey={settingKey} required={required} error={error} hint={hint} wide>
				<Input
					id={settingKey}
					value={list.join(", ")}
					placeholder="Comma-separated"
					onChange={event =>
						onChange(
							settingKey,
							event.target.value
								.split(/[,\n]/)
								.map(v => v.trim())
								.filter(Boolean),
						)
					}
				/>
			</FieldShell>
		)
	}

	if (property.type === "number" || property.type === "integer") {
		return (
			<FieldShell settingKey={settingKey} required={required} error={error} hint={hint}>
				<Input
					id={settingKey}
					type="number"
					step={property.type === "integer" ? 1 : "any"}
					min={property.minimum ?? property.exclusiveMinimum}
					max={property.maximum ?? property.exclusiveMaximum}
					value={value === undefined || value === null ? "" : String(value)}
					onChange={event =>
						onChange(
							settingKey,
							event.target.value === ""
								? undefined
								: Number(event.target.value),
						)
					}
				/>
			</FieldShell>
		)
	}

	return (
		<FieldShell settingKey={settingKey} required={required} error={error} hint={hint}>
			<Input
				id={settingKey}
				type="text"
				value={value === undefined || value === null ? "" : String(value)}
				onChange={event => onChange(settingKey, event.target.value)}
			/>
		</FieldShell>
	)
}

/** Global bot settings and operational controls, restricted to administrators. */
export function AdministrationView() {
	const { data, isLoading, mutate } = useSWR(
		"/api/admin/settings",
		getAdminSettings,
	)
	// The schema is static for a given bot build, so it never needs revalidating
	const { data: schema, isLoading: isSchemaLoading } = useSWR<SettingSchema | null>(
		"/api/admin/settings/schema",
		getAdminSettingsSchema,
		{ revalidateOnFocus: false, revalidateIfStale: false },
	)
	const [settings, setSettings] = useState<GlobalSettings | null>(null)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		if (data) setSettings(data)
	}, [data])

	const required = useMemo(
		() => new Set(schema?.required ?? []),
		[schema],
	)

	// Every schema key, in group order, with unlisted ones collected at the end
	const sections = useMemo(() => {
		if (!schema) return []
		const known = new Set(GROUPS.flatMap(g => g.keys))
		const leftovers = Object.keys(schema.properties).filter(k => !known.has(k))
		return [
			...GROUPS.map(group => ({
				...group,
				keys: group.keys.filter(k => k in schema.properties),
			})),
			...(leftovers.length
				? [
						{
							title: "Other settings",
							description:
								"Reported by the bot but not yet given a place in this dashboard.",
							keys: leftovers,
						},
					]
				: []),
		].filter(section => section.keys.length > 0)
	}, [schema])

	const errors = useMemo(() => {
		if (!schema || !settings) return {} as Record<string, string>
		const found: Record<string, string> = {}
		for (const [key, property] of Object.entries(schema.properties)) {
			const message = validate(key, property, settings[key], required.has(key))
			if (message) found[key] = message
		}
		return found
	}, [schema, settings, required])

	function update(key: string, value: unknown) {
		setSettings(current =>
			current ? Object.assign({}, current, { [key]: value }) : current,
		)
	}

	async function save() {
		if (!settings) return
		const count = Object.keys(errors).length
		if (count > 0) {
			toast(`Fix ${count} invalid setting${count === 1 ? "" : "s"} first`)
			return
		}
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

	if (isLoading || isSchemaLoading || !settings) {
		return <div className="text-sm text-zinc-500">Loading administration…</div>
	}

	if (!schema) {
		return (
			<div className="text-sm text-red-400">
				Could not load the settings schema from the bot. It may be running a
				version that predates <code>/api/admin/settings/schema</code>.
			</div>
		)
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6 pb-8">
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
				<div>
					<p className="text-sm font-medium text-violet-300">
						Administrator only
					</p>
					<h2 className="mt-1 text-3xl font-bold tracking-tight">
						Administration
					</h2>
					<p className="mt-2 max-w-2xl text-sm text-zinc-400">
						Manage the bot&apos;s runtime configuration and operational
						controls. Changes are written to <code>data/setting.json</code> and
						reloaded immediately.
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

			{sections.map(section => (
				<SettingSection
					key={section.title}
					title={section.title}
					description={section.description}
				>
					{section.keys.map(key => (
						<SettingField
							key={key}
							settingKey={key}
							property={schema.properties[key]}
							value={settings[key]}
							required={required.has(key)}
							error={errors[key]}
							onChange={update}
						/>
					))}
				</SettingSection>
			))}

			<SettingSection
				title="Operations"
				description="Run administrative actions on the bot process."
			>
				<div className="flex flex-wrap gap-3 md:col-span-2">
					<Button
						variant="secondary"
						onClick={async () =>
							toast(
								(await postAction("reload"))
									? "Commands reloaded"
									: "Failed to reload commands",
							)
						}
					>
						Reload commands
					</Button>
					<Button
						variant="secondary"
						onClick={async () =>
							toast(
								(await postAction("reloadSetting"))
									? "Settings reloaded"
									: "Failed to reload settings",
							)
						}
					>
						Reload settings
					</Button>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="destructive">Terminate bot</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Terminate the bot?</DialogTitle>
								<DialogDescription>
									This immediately stops the bot for every guild.
								</DialogDescription>
							</DialogHeader>
							<DialogFooter className="gap-2">
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button
										variant="destructive"
										onClick={() => postAction("exit")}
									>
										Terminate
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</SettingSection>
		</div>
	)
}
