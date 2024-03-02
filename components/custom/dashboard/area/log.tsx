import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import Area from "../../area"
import LogTable from "../../logTable"
import { useEffect } from "react"

export default function LogTab({auth}: {auth: string}) {
	return (
		<Area title="Logs">
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="discordLogs">
					<AccordionTrigger>Discord Bot Logs</AccordionTrigger>
					<AccordionContent>
						<LogTable auth={auth} type={['dcblog', 'dcbmsg']} caption="Discord Log" />
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="expressLogs">
					<AccordionTrigger>Express Logs</AccordionTrigger>
					<AccordionContent>Hello</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Area>
	)
}
