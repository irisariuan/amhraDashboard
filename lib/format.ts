/** Seconds → `HH:mm:ss` (video durations). */
export function formatDuration(totalSeconds: number): string {
	const seconds = Math.max(0, Math.floor(totalSeconds))
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":")
}

/** Seconds → `mm:ss` (playback clock). */
export function formatClock(totalSeconds: number): string {
	const seconds = Math.max(0, totalSeconds)
	const m = Math.floor(seconds / 60)
	const s = Math.floor(seconds % 60)
	return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

const logDateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
})

/** Timestamp → `Jul 17, 2026, 2:30 PM` (log table). */
export function formatLogDate(time: string | number): string {
	return logDateFormatter.format(new Date(time))
}
