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

/** Milliseconds ahead → `in 2d 3h` / `in 3h 12m` / `in 4m 05s` / `in 8s` (schedules). */
export function formatCountdown(ms: number): string {
	const total = Math.max(0, Math.ceil(ms / 1000))
	const d = Math.floor(total / 86400)
	const h = Math.floor((total % 86400) / 3600)
	const m = Math.floor((total % 3600) / 60)
	const s = total % 60
	if (d > 0) return `in ${d}d ${h}h`
	if (h > 0) return `in ${h}h ${m}m`
	if (m > 0) return `in ${m}m ${s.toString().padStart(2, "0")}s`
	return `in ${s}s`
}

const scheduleDateFormatter = new Intl.DateTimeFormat("en", {
	weekday: "short",
	month: "short",
	day: "numeric",
	hour: "numeric",
	minute: "2-digit",
})

/** Timestamp → `Thu, Oct 22, 9:30 PM` (schedules, in the viewer's timezone). */
export function formatScheduleDate(time: number): string {
	return scheduleDateFormatter.format(new Date(time))
}
