'use client'
import { ReloadIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

export default function ReloadCircle({ size = { big: 8, small: 6 } }: { size?: { big: number, small: number } }) {
    return <motion.div
        animate={{
            rotate: [0, 360],
        }}
        transition={{
            repeat: Number.POSITIVE_INFINITY,
            type: 'spring',
            bounce: 0.2,
            duration: 1,
            repeatDelay: 0.5,
        }}
    >
        <ReloadIcon className={`h-${size.small} w-${size.small} lg:h-${size.big} lg:w-${size.big}`} />
    </motion.div>
}