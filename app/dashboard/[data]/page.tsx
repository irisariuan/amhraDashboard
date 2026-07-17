"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { SongDashboard } from "@/components/dashboard/song/song-dashboard"
import { verifyVisitor } from "@/lib/api/auth"
import type { GuildSession } from "@/lib/session"

enum Status {
	Loading = 0,
	Loaded = 1,
	Error = 2,
}

type Params = Promise<{ data: string }>

/**
 * One-time visitor link: the URL segment is base64-encoded JSON
 * `{ guildId, auth }`. The token is re-verified against the bot every 5 s
 * and the page invalidates itself when the link expires.
 */
export default function VisitorPage(props: { params: Params }) {
	const params = use(props.params)
	const [status, setStatus] = useState(Status.Loading)
	const [session, setSession] = useState<GuildSession | null>(null)
	const router = useRouter()

	useEffect(() => {
		let visitorSession: GuildSession
		try {
			const { guildId, auth }: { guildId: string; auth: string } =
				JSON.parse(atob(decodeURI(params.data)))
			visitorSession = { type: "visitor", token: auth, guildId }
		} catch {
			setStatus(Status.Error)
			return
		}

		async function verify() {
			try {
				const ok = await verifyVisitor(visitorSession)
				setStatus(ok ? Status.Loaded : Status.Error)
				setSession(visitorSession)
			} catch {
				setStatus(Status.Error)
			}
		}

		verify()
		const interval = setInterval(verify, 1000 * 5)
		return () => clearInterval(interval)
	}, [params.data])

	useEffect(() => {
		if (status === Status.Error) {
			router.push("/")
		}
	}, [status, router])

	if (status === Status.Loaded && session) {
		return (
			<motion.div
				className="flex justify-center items-center w-full h-full p-4 lg:p-0"
				animate={{ opacity: [0, 1], scale: [0, 1] }}
			>
				<div className="bg-white dark:bg-zinc-900 p-8 rounded-xl w-full h-full overflow-auto lg:h-5/6 lg:w-5/6">
					<SongDashboard session={session} />
				</div>
			</motion.div>
		)
	}

	if (status === Status.Loading) {
		return (
			<div className="flex justify-center items-center w-full h-full">
				<p className="text-3xl text-white">Opening...</p>
			</div>
		)
	}

	return (
		<div className="flex justify-center items-center w-full h-full flex-col gap-2">
			<p className="text-3xl text-white">Error!</p>
			<Link href="/">
				<p className="text-blue-500 underline text-xl">
					Return to Home Page
				</p>
			</Link>
		</div>
	)
}
