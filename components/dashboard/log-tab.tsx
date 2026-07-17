"use client"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { Area } from "@/components/shared/area"
import type { Session } from "@/lib/session"
import { LogTable } from "./log-table"

export function LogTab({ session }: { session: Session }) {
	return (
		<Area title="Logs">
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="discordLogs">
					<AccordionTrigger>Discord Bot Logs</AccordionTrigger>
					<AccordionContent>
						<LogTable session={session} types={["dcblog"]} />
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="expressLogs">
					<AccordionTrigger>Express Logs</AccordionTrigger>
					<AccordionContent>
						<LogTable
							session={session}
							types={["experr", "explog"]}
						/>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="messageLogs">
					<AccordionTrigger>Message Logs</AccordionTrigger>
					<AccordionContent>
						<LogTable session={session} types={["dcbmsg"]} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Area>
	)
}
