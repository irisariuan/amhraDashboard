"use client"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Spinner } from "@/components/shared/spinner"
import { useAccount } from "@/hooks/use-account"
import { loginAnonymous } from "@/lib/api/auth"

enum Status {
	Loading = 0,
	Ready = 1,
	Error = 2,
}

type Params = Promise<{ data: string }>

/**
 * Visitor link from the Discord /dashboard command. The URL segment is
 * base64-encoded `{ guildId, auth }`; we validate the token (which stores it as
 * an anonymous session cookie) and then render the player for that one guild.
 */
export default function VisitorPage(props: { params: Params }) {
	const params = use(props.params)
	const [status, setStatus] = useState(Status.Loading)
	const [guildId, setGuildId] = useState<string | null>(null)
	const { account, mutate } = useAccount()

	useEffect(() => {
		let guild: string
		let auth: string
		try {
			;({ guildId: guild, auth } = JSON.parse(atob(decodeURI(params.data))))
		} catch {
			setStatus(Status.Error)
			return
		}
		loginAnonymous(auth, guild)
			.then(async ok => {
				if (!ok) return setStatus(Status.Error)
				setGuildId(guild)
				await mutate()
				setStatus(Status.Ready)
			})
			.catch(() => setStatus(Status.Error))
	}, [params.data, mutate])

	if (status === Status.Ready && guildId && account) {
		return <DashboardShell account={account} fixedGuildId={guildId} />
	}
	if (status === Status.Error) {
		return (
			<div className="flex flex-col items-center justify-center h-full gap-2">
				<p className="text-2xl">This link has expired.</p>
				<Link href="/" className="text-indigo-400 underline">
					Return home
				</Link>
			</div>
		)
	}
	return (
		<div className="grid place-items-center h-full">
			<Spinner />
		</div>
	)
}
