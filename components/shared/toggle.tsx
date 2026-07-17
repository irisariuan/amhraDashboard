"use client"
import { cn } from "@/lib/utils"

/** Labelled switch row used across settings. */
export function Toggle({
	label,
	description,
	checked,
	onChange,
	disabled,
}: {
	label: string
	description?: string
	checked: boolean
	onChange: (value: boolean) => void
	disabled?: boolean
}) {
	return (
		<div className="flex items-center justify-between py-4">
			<div>
				<p className="font-medium">{label}</p>
				{description && (
					<p className="text-sm text-zinc-500">{description}</p>
				)}
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				disabled={disabled}
				onClick={() => onChange(!checked)}
				className={cn(
					"relative h-6 w-11 rounded-full transition-colors disabled:opacity-50",
					checked ? "bg-indigo-500" : "bg-white/15",
				)}
			>
				<span
					className={cn(
						"absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
						checked && "translate-x-5",
					)}
				/>
			</button>
		</div>
	)
}
