"use client"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { LogTable } from "./log-table"

/** Admin log viewer (message/voice logging has been removed from the bot). */
export function LogView() {
	return (
		<div>
			<h2 className="text-2xl font-bold mb-4">Logs</h2>
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="discordLogs">
					<AccordionTrigger>Discord Bot Logs</AccordionTrigger>
					<AccordionContent>
						<LogTable types={["dcblog"]} />
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="expressLogs">
					<AccordionTrigger>Server Logs</AccordionTrigger>
					<AccordionContent>
						<LogTable types={["experr", "explog"]} />
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="errorLogs">
					<AccordionTrigger>Errors & Warnings</AccordionTrigger>
					<AccordionContent>
						<LogTable types={["error", "errwn", "errim"]} />
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	)
}
