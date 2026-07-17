"use client"
import { motion } from "framer-motion"
import { Spinner } from "@/components/shared/spinner"

export function PlayerPlaceholder({
	showWaitedMessage,
}: {
	showWaitedMessage: boolean
}) {
	return (
		<div className="w-full h-full flex items-center justify-center flex-col gap-2">
			<div className="flex items-center justify-center gap-1">
				<p className="text-xl lg:text-3xl font-semibold">Loading...</p>
				<Spinner />
			</div>
			{showWaitedMessage && (
				<motion.p
					animate={{ opacity: [0, 1], y: [20, 0], scale: [0.6, 1] }}
					transition={{ duration: 0.5, type: "tween" }}
					className="text-center"
				>
					The music player may not been initialized yet, please check
					if it is initialized
				</motion.p>
			)}
		</div>
	)
}
