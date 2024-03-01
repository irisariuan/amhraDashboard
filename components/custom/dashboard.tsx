"use client"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/api/web"
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

export default function Dashboard({ auth }: { auth: string }) {
	const router = useRouter()
	async function clickHandler() {
		logout(auth)
		window?.localStorage?.removeItem("key")
		router.push("/login")
	}
	return (
		<div className="flex h-full w-full items-center justify-center">
			<div className="min-w-[50%] min-h-[30%] bg-white p-12 rounded-xl space-y-8">
				<div className="flex items-center gap-2">
					<TooltipProvider>
						<Tooltip>
							<h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
								Amhra Dashboard
							</h1>
							<TooltipTrigger>
								<motion.div
									animate={{
										transition: {
											repeat: Infinity,
											repeatType: "reverse",
											duration: 6,
										},
										boxShadow: [
											"5px 5px 30px 5px rgba(102,255,115,0)",
											"5px 5px 30px 5px rgba(102,255,115,1)",
										],
									}}
									className="w-4 h-4 rounded-full bg-green-400"
								></motion.div>
							</TooltipTrigger>
							<TooltipContent>
								<p>Running</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<Tabs defaultValue="admin">
					<TabsList className="mb-4">
						<TabsTrigger value="admin">Administration</TabsTrigger>
						<TabsTrigger value="song">Logs</TabsTrigger>
					</TabsList>
					<div className="bg-slate-50 p-8 rounded-xl">
						<TabsContent value="admin">
							<ActionTab clickHandler={clickHandler} auth={auth} />
						</TabsContent>
						<TabsContent value="song">
							<LogTab auth={auth} />
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</div>
	)
}
