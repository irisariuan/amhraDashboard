"use client"
import { useEffect, useState } from "react"

/** The current time, re-read every `intervalMs` while `active`. */
export function useNow(active: boolean, intervalMs = 1000): number {
	const [now, setNow] = useState(() => Date.now())

	useEffect(() => {
		if (!active) return
		const tick = () => setNow(Date.now())
		// The value from before going active can be minutes old, so the first
		// read is right away rather than one interval in
		const first = setTimeout(tick, 0)
		const intervalId = setInterval(tick, intervalMs)
		return () => {
			clearTimeout(first)
			clearInterval(intervalId)
		}
	}, [active, intervalMs])

	return now
}
