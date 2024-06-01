import { motion } from "framer-motion";
import ReloadCircle from "../reloadCircle";

export default function DashboardPlaceholder({ showWaitedMessage }: { showWaitedMessage: boolean }) {
    return (<div className="w-full h-full flex items-center justify-center flex-col gap-2">
        <div className="flex items-center justify-center gap-1">
            <p className="text-xl lg:text-3xl font-semibold">Loading...</p>
            <ReloadCircle />
        </div>
        <>
            {showWaitedMessage && (
                <motion.p
                    animate={{ opacity: [0, 1], y: [20, 0], scale: [0.6, 1] }}
                    transition={{ duration: 0.5, type: 'tween' }}
                    className="text-center"
                >
                    The music player may not been initialized yet, please check if it is initialized
                </motion.p>
            )}
        </>
    </div>)
}