"use client"
import { Label } from "@/components/ui/label"
import { DeviceType, useDevice } from "@/hooks/use-device"
import { useEffect, useRef, useState } from "react"

/**
 * Draggable progress bar with a value tooltip and, on desktop, a hover
 * preview handle. Used for both seeking and volume.
 */
export function ScrubBar({
	now,
	totalValue,
	onRelease = () => {},
	enabled = false,
	formatter,
}: {
	now: number
	totalValue: number
	onRelease?: (value: number) => void
	enabled?: boolean
	formatter: (value: number) => string
}) {
	const barRef = useRef<HTMLDivElement>(null)
	const previewRef = useRef<HTMLDivElement>(null)
	const device = useDevice()
	const [value, setValue] = useState(now / totalValue)
	const [dragging, setDragging] = useState(false)
	const [previewValue, setPreviewValue] = useState(0)

	function fractionAt(element: HTMLDivElement | null, clientX: number) {
		if (!element) return null
		const { left, right } = element.getBoundingClientRect()
		return (Math.min(Math.max(clientX, left), right) - left) / (right - left)
	}

	function drag(clientX: number) {
		if (!enabled) return
		const fraction = fractionAt(barRef.current, clientX)
		if (fraction !== null) setValue(fraction)
	}

	function preview(clientX: number) {
		if (!enabled) return
		const fraction = fractionAt(previewRef.current, clientX)
		if (fraction !== null) setPreviewValue(fraction)
	}

	function release() {
		setDragging(false)
		if (!enabled) return
		onRelease(value * totalValue)
	}

	useEffect(() => {
		if (dragging) return
		setValue(now / totalValue)
	}, [now, dragging, totalValue])

	return (
		<div
			className="w-full bg-neutral-300 dark:bg-neutral-700 h-4 rounded-full group my-2"
			ref={barRef}
			onTouchStart={() => enabled && setDragging(true)}
			onTouchMove={ev => enabled && dragging && drag(ev.touches[0].clientX)}
			onTouchEnd={release}
			onTouchCancel={() => setDragging(false)}
			onMouseDown={() => enabled && setDragging(true)}
			onMouseMove={ev => enabled && dragging && drag(ev.clientX)}
			onMouseUp={release}
		>
			<div
				className="bg-blue-500 dark:bg-neutral-500 h-full rounded-full flex items-center justify-end transform-gpu overflow-visible relative left-0 z-0"
				style={{ width: `${Math.min(value * 100, 100)}%` }}
			>
				{enabled && (
					<div className="min-w-2 w-2 h-6 rounded-full bg-blue-600 dark:bg-neutral-100 relative left-1 hover:cursor-grab active:cursor-grabbing flex justify-center z-0">
						<div
							className={`min-w-fit relative bottom-8 border border-neutral-500 bg-neutral-100 dark:bg-neutral-800 origin-center p-2 rounded justify-center items-center group-hover:flex ${dragging ? "flex" : "hidden"} transition-all`}
						>
							<Label className="text-neutral-700 dark:text-white font-light select-none">
								{formatter(value * totalValue)}
							</Label>
						</div>
					</div>
				)}
			</div>
			{device === DeviceType.Desktop && (
				<div
					className="relative h-4 bottom-4 rounded-full items-center flex w-full"
					ref={previewRef}
					onMouseMove={ev => enabled && !dragging && preview(ev.clientX)}
				>
					{enabled && !dragging && (
						<div
							className="w-full flex justify-end items-center z-50 h-4 rounded-full transform"
							style={{ width: `${Math.min(previewValue * 100, 100)}%` }}
						>
							<div className="min-w-2 w-2 h-6 rounded-full bg-neutral-400 dark:bg-neutral-600 relative hover:cursor-grab active:cursor-grabbing invisible group-hover:visible flex justify-center left-1">
								<div className="min-w-fit relative bottom-8 border border-neutral-500 bg-neutral-200 dark:bg-neutral-900 origin-center p-2 rounded justify-center items-center flex">
									<Label className="text-neutral-500 font-light select-none">
										{formatter(previewValue * totalValue)}
									</Label>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
