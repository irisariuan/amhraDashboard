"use client"
import {
	GearIcon,
	ListBulletIcon,
	PersonIcon,
	RocketIcon,
} from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { usePlayingGuilds } from "@/hooks/use-guilds"
import type { Account } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { AccountView } from "./account-view"
import { AdminView } from "./action-tab"
import { LogView } from "./log-tab"
import { SettingsView } from "./settings-view"
import { PlaybackBar } from "./song/playback-bar"
import { SongDashboard } from "./song/song-dashboard"

type View = "player" | "settings" | "account" | "logs"

/**
 * The dashboard chrome: a slim icon sidebar, a guild picker, the active view,
 * and — in the player view — a persistent bottom playback bar.
 */
export function DashboardShell({
	account,
	fixedGuildId,
}: {
	account: Account
	/** For visitor sessions, the single guild they may control. */
	fixedGuildId?: string
}) {
	const { data: guilds } = usePlayingGuilds()
	const [guildId, setGuildId] = useState<string | null>(fixedGuildId ?? null)
	const [view, setView] = useState<View>("player")

	// Default to the first available guild once loaded.
	useEffect(() => {
		if (fixedGuildId || guildId) return
		if (guilds.length > 0) setGuildId(guilds[0].id)
	}, [guilds, guildId, fixedGuildId])

	const isVisitor = account.type === "anonymous"

	const nav: { id: View; label: string; icon: React.ReactNode; show: boolean }[] =
		[
			{ id: "player", label: "Player", icon: <RocketIcon />, show: true },
			{
				id: "logs",
				label: "Logs",
				icon: <ListBulletIcon />,
				show: account.isAdmin,
			},
			{
				id: "settings",
				label: "Settings",
				icon: <GearIcon />,
				show: !isVisitor,
			},
			{
				id: "account",
				label: "Account",
				icon: <PersonIcon />,
				show: !isVisitor,
			},
		]

	return (
		<div className="flex h-full w-full bg-zinc-950 text-zinc-100">
			{/* Sidebar */}
			<nav className="hidden sm:flex flex-col items-center gap-1 w-16 border-r border-white/10 py-4">
				<div className="mb-4 h-9 w-9 rounded-xl bg-indigo-500 grid place-items-center font-black">
					A
				</div>
				{nav
					.filter(n => n.show)
					.map(n => (
						<button
							key={n.id}
							type="button"
							title={n.label}
							onClick={() => setView(n.id)}
							className={cn(
								"h-10 w-10 rounded-xl grid place-items-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors",
								view === n.id && "bg-white/10 text-white",
							)}
						>
							{n.icon}
						</button>
					))}
			</nav>

			<div className="flex-1 flex flex-col min-w-0">
				{/* Top bar */}
				<header className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
					<h1 className="text-lg font-bold">Amhra</h1>
					{view === "player" && !fixedGuildId && (
						<div className="ml-auto w-64">
							<Select
								value={guildId ?? undefined}
								onValueChange={setGuildId}
								disabled={guilds.length === 0}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={
											guilds.length ? "Select a server" : "No active players"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{guilds.map(g => (
										<SelectItem key={g.id} value={g.id}>
											{g.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</header>

				{/* Main view */}
				<main className="flex-1 overflow-auto p-5 min-h-0">
					{view === "player" &&
						(guildId ? (
							<SongDashboard guildId={guildId} />
						) : (
							<div className="grid place-items-center h-full text-zinc-500">
								Select a server to start controlling playback.
							</div>
						))}
					{view === "logs" && account.isAdmin && <LogView />}
					{view === "settings" && !isVisitor && <SettingsView />}
					{view === "account" && !isVisitor && (
						<AccountView account={account} />
					)}
					{view === "account" && account.isAdmin && (
						<div className="mt-10">
							<AdminView />
						</div>
					)}
				</main>

				{/* Persistent playback bar */}
				{view === "player" && guildId && <PlaybackBar guildId={guildId} />}
			</div>
		</div>
	)
}
