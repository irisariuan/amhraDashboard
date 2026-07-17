"use client"
import useSWR from "swr"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Toggle } from "@/components/shared/toggle"
import { getSettings, saveSettings } from "@/lib/api/settings"

const LANGUAGES: Record<string, string> = {
	en: "English",
	ja: "日本語",
	ko: "한국어",
	zhTw: "繁體中文",
}

/** Per-account playback preferences. */
export function SettingsView() {
	const { data, isLoading, mutate } = useSWR("/api/setting", getSettings)

	async function update(patch: Parameters<typeof saveSettings>[0]) {
		if (!data) return
		mutate({ ...data, ...patch }, { revalidate: false })
		if (await saveSettings(patch)) toast("Settings saved")
		else {
			toast("Failed to save settings")
			mutate()
		}
	}

	if (isLoading || !data) {
		return <Skeleton className="w-full h-40" />
	}

	return (
		<div className="max-w-lg">
			<h2 className="text-2xl font-bold mb-6">Settings</h2>
			<div className="flex flex-col divide-y divide-white/5">
				<Toggle
					label="Radio mode"
					description="Auto-queue a related track when the queue runs out"
					checked={data.autoSuggest}
					onChange={v => update({ autoSuggest: v })}
				/>
				<Toggle
					label="Auto skip non-music"
					description="Skip sponsored / non-music segments automatically"
					checked={data.autoSkip}
					onChange={v => update({ autoSkip: v })}
				/>
				<Toggle
					label="Loop"
					description="Repeat the queue by default"
					checked={data.loop}
					onChange={v => update({ loop: v })}
				/>
				<div className="flex items-center justify-between py-4">
					<div>
						<p className="font-medium">Language</p>
						<p className="text-sm text-zinc-500">Bot response language</p>
					</div>
					<Select
						value={data.language}
						onValueChange={v => update({ language: v })}
					>
						<SelectTrigger className="w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(LANGUAGES).map(([code, name]) => (
								<SelectItem key={code} value={code}>
									{name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	)
}
