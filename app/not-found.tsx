import GlitchText from "@/components/custom/glitch";
import Link from "next/link";
import { GoAlertFill } from "react-icons/go";
export default function NotFound() {
    return (
        <div className='h-full flex items-center justify-center'>
            <div className="flex items-center justify-center flex-col">
            <div className="flex items-center gap-2">
                <GoAlertFill className="text-7xl" />
                <h1 className='text-9xl font-extrabold'>
                    404
                </h1>
            </div>
            <GlitchText className="text-2xl">Page Not Found!</GlitchText>
            <Link href="/" className="mt-4">
                <span className="text-blue-500 underline text-xl">Return to Home Page</span>
            </Link>
            </div>
        </div>
    )
}