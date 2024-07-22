"use client"
import { useRouter } from "next/navigation"
import { AuthData, logout } from "@/lib/api/web"
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import ActionTab from "./dashboard/area/action"
import LogTab from "./dashboard/area/log"
import SongTab from "./dashboard/area/song"
import MessageTab from "./dashboard/area/message"

export default function Dashboard({ auth, bearer = false }: { auth: string, bearer?: boolean }) {
	
	return (
		<div className="flex h-full w-full items-center justify-center p-4 lg:p-0">
			<div className="dark:bg-zinc-900 bg-white p-8 rounded-xl w-full h-full lg:h-5/6 lg:w-5/6 overflow-auto shadow-2xl flex flex-col">
				<div className="flex items-center gap-2 sm:justify-center">
					<TooltipProvider>
						<Tooltip>
							<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
								Amhra Dashboard
							</h1>
							<TooltipTrigger>
								<motion.div
									animate={{
										transition: {
											repeat: Number.POSITIVE_INFINITY,
											repeatType: "reverse",
											duration: 6,
										},
										boxShadow: [
											"5px 5px 30px 5px rgba(102,255,115,0)",
											"5px 5px 30px 5px rgba(102,255,115,1)",
										],
									}}
									className="w-4 h-4 rounded-full bg-green-400"
								/>
							</TooltipTrigger>
							<TooltipContent>
								<p>Running</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<Tabs defaultValue={bearer ? 'song' : "admin"} className="flex flex-col mt-2 flex-1">
					<div className="flex justify-center">
						<TabsList className="mb-4">
							<TabsTrigger value="admin">Administration</TabsTrigger>
							<TabsTrigger value="log" disabled={bearer}>Logs</TabsTrigger>
							<TabsTrigger value="song">Song</TabsTrigger>
							<TabsTrigger value="message" disabled={bearer}>Message</TabsTrigger>
						</TabsList>
					</div>
					<div className="bg-zinc-50 dark:bg-zinc-950 lg:p-8 p-2 rounded-xl flex-1 h-full">
						<TabsContent value="admin">
							<ActionTab authData={{auth, bearer}} />
						</TabsContent>
						<TabsContent value="log">
							<LogTab auth={auth} />
						</TabsContent>
						<TabsContent value="song">
							<SongTab auth={auth} bearer={bearer} />
						</TabsContent>
						<TabsContent value="message">
							<MessageTab auth={auth} />
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</div>
	)
}
