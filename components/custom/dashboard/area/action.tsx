"use client"
import { Button } from "../../../ui/button"
import { ActionType, type AuthData, logout, postAction } from "@/lib/api/web"
import Area from "../../area"
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
import { redirect, useRouter } from "next/navigation"
import { Optional } from "../../optional"

export default function ActionTab({
	authData,
}: {
	authData: Pick<AuthData, 'auth' | 'bearer'>
}) {
	const router = useRouter()
	async function clickHandler() {
		logout(authData.auth)
		window?.localStorage?.removeItem("key")
		window?.localStorage?.removeItem("bearer")
		router.push("/login")
	}
	return (
		<Area title="Action">
			<Button onClick={clickHandler}>Logout</Button>
			<Optional hidden={authData.bearer}>
				<Dialog>
					<DialogTrigger>
						<Button>Terminate</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Are you absolutely sure?</DialogTitle>
							<DialogDescription>
								This action cannot be undone. The bot will be terminated
								immediately.
							</DialogDescription>
							<DialogFooter>
								<div className="flex w-full gap-2 mt-8">
									<DialogClose className="w-full">
										<Button
											className="w-full"
											variant="destructive"
											onClick={() => {
												postAction(authData.auth, { action: ActionType.Exit })
												window.localStorage.removeItem("key")
												redirect("/login")
											}}
										>
											Confirm
										</Button>
									</DialogClose>
									<DialogClose className="w-full">
										<Button className="w-full" variant="outline">
											Cancel
										</Button>
									</DialogClose>
								</div>
							</DialogFooter>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			</Optional>
			<Optional hidden={authData.bearer}>
				<Button onClick={() => {postAction(authData.auth, {action: ActionType.ReloadCommands})}}>Reload Commands</Button>
			</Optional>
			<Optional hidden={authData.bearer}>
				<Button onClick={() => {postAction(authData.auth, {action: ActionType.ReloadSetting})}}>Reload Settings</Button>
			</Optional>
		</Area>
	)
}
