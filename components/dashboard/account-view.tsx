"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FaDiscord } from "react-icons/fa"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { addPasskey, logout, unlinkDiscord } from "@/lib/api/auth"
import type { Account } from "@/lib/api/types"

const DISCORD_LINK = process.env.NEXT_PUBLIC_INVITE_LINK

/** Account management: passkeys, Discord link, sign out. */
export function AccountView({ account }: { account: Account }) {
	const router = useRouter()
	const [busy, setBusy] = useState(false)

	async function handleAddPasskey() {
		setBusy(true)
		try {
			if (await addPasskey()) toast("Passkey added")
			else toast("Could not add passkey")
		} catch {
			toast("Passkey registration was cancelled")
		} finally {
			setBusy(false)
		}
	}

	async function handleSignOut() {
		await logout()
		router.push("/login")
	}

	return (
		<div className="max-w-lg">
			<h2 className="text-2xl font-bold mb-6">Account</h2>
			<div className="rounded-xl border border-white/10 p-5 flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<div className="h-12 w-12 rounded-full bg-indigo-500/20 grid place-items-center text-indigo-300 font-bold">
						{(account.displayName ?? "A").slice(0, 1).toUpperCase()}
					</div>
					<div>
						<p className="font-semibold">
							{account.displayName ?? "Web account"}
						</p>
						<div className="flex gap-2 mt-1">
							<Badge variant="secondary">{account.type}</Badge>
							{account.isAdmin && <Badge>admin</Badge>}
						</div>
					</div>
				</div>
				<p className="text-xs text-zinc-500 font-mono break-all">
					{account.id}
				</p>
			</div>

			<div className="mt-6 flex flex-col gap-3">
				<Button variant="secondary" onClick={handleAddPasskey} disabled={busy}>
					Add a passkey
				</Button>
				{DISCORD_LINK && (
					<Button
						variant="secondary"
						className="bg-discord hover:bg-discord-dark text-white"
						asChild
					>
						<a href={DISCORD_LINK}>
							<FaDiscord className="mr-2" /> Link Discord
						</a>
					</Button>
				)}
				<Button
					variant="ghost"
					className="text-zinc-400"
					onClick={async () => {
						if (await unlinkDiscord()) toast("Discord unlinked")
						else toast("Nothing to unlink")
					}}
				>
					Unlink Discord
				</Button>
				<Button variant="destructive" onClick={handleSignOut}>
					Sign out
				</Button>
			</div>
		</div>
	)
}
