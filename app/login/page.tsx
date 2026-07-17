"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { FaDiscord } from "react-icons/fa"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentAccount, loginPasskey, registerPasskey } from "@/lib/api/auth"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default function LoginPage(props: { searchParams: SearchParams }) {
	const searchParams = use(props.searchParams)
	const router = useRouter()
	const [agreed, setAgreed] = useState(searchParams?.checked === "true")
	const [displayName, setDisplayName] = useState("")
	const [busy, setBusy] = useState(false)

	// If already signed in, skip straight to the dashboard.
	useEffect(() => {
		getCurrentAccount().then(a => {
			if (a) router.replace("/dashboard")
		})
	}, [router])

	async function withBusy(fn: () => Promise<boolean>, cancelMsg: string) {
		setBusy(true)
		try {
			if (await fn()) router.push("/dashboard")
			else toast("That didn't work. Please try again.")
		} catch {
			toast(cancelMsg)
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="h-full w-full flex items-center justify-center p-4">
			<div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-white/10 p-8 flex flex-col gap-5 shadow-2xl">
				<div className="text-center">
					<div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-indigo-500 grid place-items-center font-black text-xl">
						A
					</div>
					<h1 className="text-2xl font-extrabold">Amhra</h1>
					<p className="text-sm text-zinc-400 mt-1">
						Sign in with a passkey — no passwords.
					</p>
				</div>

				<label className="flex items-center gap-2 text-sm text-zinc-400">
					<input
						type="checkbox"
						checked={agreed}
						onChange={e => setAgreed(e.target.checked)}
					/>
					I agree to the{" "}
					<Link href="/terms" className="text-indigo-400 underline">
						Terms of Service
					</Link>
				</label>

				{agreed && (
					<div className="flex flex-col gap-3">
						<Button
							disabled={busy}
							onClick={() =>
								withBusy(loginPasskey, "Passkey sign-in was cancelled")
							}
						>
							Sign in with a passkey
						</Button>

						<div className="flex items-center gap-2 text-xs text-zinc-600">
							<div className="flex-1 h-px bg-white/10" />
							new here?
							<div className="flex-1 h-px bg-white/10" />
						</div>

						<Input
							placeholder="Display name (optional)"
							value={displayName}
							onChange={e => setDisplayName(e.target.value)}
							className="bg-white/5 border-white/10"
						/>
						<Button
							variant="secondary"
							disabled={busy}
							onClick={() =>
								withBusy(
									() => registerPasskey(displayName || undefined),
									"Passkey registration was cancelled",
								)
							}
						>
							Create an account with a passkey
						</Button>

						<Button
							variant="secondary"
							className="bg-discord hover:bg-discord-dark text-white"
							asChild
						>
							<Link href="/discord">
								<FaDiscord className="mr-2" /> Continue with Discord
							</Link>
						</Button>

						<Link
							href="/invite"
							className="text-center text-xs text-zinc-500 underline"
						>
							Not a user? Add Amhra to your server
						</Link>
					</div>
				)}
			</div>
		</div>
	)
}
