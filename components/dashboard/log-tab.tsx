"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { formatLogDate } from "@/lib/format"
import { useLogs } from "@/hooks/use-logs"
import { LogTable } from "./log-table"

/** A consolidated, live log stream for administrators. */
export function LogView() {
	const { data, isLoading, error } = useLogs(true)

	if (isLoading) {
		return <Skeleton className="h-96 w-full rounded-xl" />
	}

	if (error) {
		return <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-5 text-sm text-red-200">Unable to load logs. The connection will retry automatically.</div>
	}

	const logs = data ?? []
	const warningCount = logs.filter(log => ["error", "errim", "errwn", "experr"].includes(log.type)).length
	const serverCount = logs.filter(log => ["explog", "experr"].includes(log.type)).length
	const latest = logs[0]?.time

	return (
		<div className="mx-auto max-w-7xl space-y-6 pb-8">
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
				<div>
					<p className="text-sm font-medium text-violet-300">Live activity</p>
					<h2 className="mt-1 text-3xl font-bold tracking-tight">Logs</h2>
					<p className="mt-2 text-sm text-zinc-400">A unified stream of bot, server, and diagnostic messages. Refreshes every three seconds.</p>
				</div>
				<p className="text-xs text-zinc-500">{latest ? `Latest event ${formatLogDate(latest)}` : "No events recorded"}</p>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				<LogStat label="Events in memory" value={logs.length} />
				<LogStat label="Warnings & errors" value={warningCount} tone={warningCount ? "warning" : undefined} />
				<LogStat label="Server events" value={serverCount} />
			</div>

			<section className="rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:p-5">
				<LogTable logs={logs} />
			</section>
		</div>
	)
}

function LogStat({ label, value, tone }: { label: string; value: number; tone?: "warning" }) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
			<p className="text-sm text-zinc-400">{label}</p>
			<p className={tone ? "mt-1 text-2xl font-semibold text-amber-300" : "mt-1 text-2xl font-semibold"}>{value}</p>
		</div>
	)
}
