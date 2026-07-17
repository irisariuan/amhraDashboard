"use client"
import { useEffect, useState } from "react"

export enum DeviceType {
	Mobile = 0,
	Tablet = 1,
	Desktop = 2,
}

/** User-agent based device detection; null until mounted. */
export function useDevice(): DeviceType | null {
	const [device, setDevice] = useState<DeviceType | null>(null)

	useEffect(() => {
		const detect = () => {
			const userAgent = navigator.userAgent.toLowerCase()
			const isMobile =
				/iphone|ipad|ipod|android|blackberry|windows phone/g.test(userAgent)
			const isTablet =
				/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/g.test(userAgent)
			setDevice(
				isMobile
					? DeviceType.Mobile
					: isTablet
						? DeviceType.Tablet
						: DeviceType.Desktop,
			)
		}
		detect()
		window.addEventListener("resize", detect)
		return () => window.removeEventListener("resize", detect)
	}, [])

	return device
}
