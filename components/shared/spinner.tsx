"use client"
import { ReloadIcon } from "@radix-ui/react-icons"
import { motion } from "framer-motion"

export function Spinner() {
	return (
		<motion.div
			animate={{ rotate: [0, 360] }}
			transition={{
				repeat: Number.POSITIVE_INFINITY,
				type: "spring",
				bounce: 0.2,
				duration: 1,
				repeatDelay: 0.5,
			}}
		>
			<ReloadIcon className="h-6 w-6 lg:h-8 lg:w-8" />
		</motion.div>
	)
}
