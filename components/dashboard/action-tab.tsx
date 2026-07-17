"use client"
import { redirect, useRouter } from "next/navigation"
import { Area } from "@/components/shared/area"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { logout, postAction } from "@/lib/api/auth"
import { ActionType } from "@/lib/api/types"
import { clearStoredSession, type Session } from "@/lib/session"

export function ActionTab({ session }: { session: Session }) {
	const router = useRouter()
	const isAdmin = session.type === "admin"

	function handleLogout() {
		logout(session)
		clearStoredSession()
		router.push("/login")
	}

	return (
		<Area title="Action">
			<div className="overflow-hidden flex flex-wrap gap-2 *:flex-1">
				<Button onClick={handleLogout}>Logout</Button>
				{isAdmin && (
					<Dialog>
						<DialogTrigger>
							<Button className="w-full">Terminate</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									Are you absolutely sure?
								</DialogTitle>
								<DialogDescription>
									This action cannot be undone. The bot will
									be terminated immediately.
								</DialogDescription>
								<DialogFooter>
									<div className="flex w-full gap-2 mt-8">
										<DialogClose className="w-full">
											<Button
												className="w-full"
												variant="destructive"
												onClick={() => {
													postAction(session, {
														action: ActionType.Exit,
													})
													clearStoredSession()
													redirect("/login")
												}}
											>
												Confirm
											</Button>
										</DialogClose>
										<DialogClose className="w-full">
											<Button
												className="w-full"
												variant="outline"
											>
												Cancel
											</Button>
										</DialogClose>
									</div>
								</DialogFooter>
							</DialogHeader>
						</DialogContent>
					</Dialog>
				)}
				{isAdmin && (
					<Button
						onClick={() => {
							postAction(session, {
								action: ActionType.ReloadCommands,
							})
						}}
					>
						Reload Commands
					</Button>
				)}
				{isAdmin && (
					<Button
						onClick={() => {
							postAction(session, {
								action: ActionType.ReloadSetting,
							})
						}}
					>
						Reload Settings
					</Button>
				)}
			</div>
		</Area>
	)
}
