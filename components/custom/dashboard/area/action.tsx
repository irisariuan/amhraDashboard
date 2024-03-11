"use client"
import { Button } from "../../../ui/button"
import { postAction } from "@/lib/api/web"
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
import { redirect } from "next/navigation"

export default function ActionTab({
	clickHandler,
	auth,
}: {
	clickHandler: () => void
	auth: string
}) {
	return (
		<Area title="Action">
			<Button onClick={clickHandler}>Logout</Button>
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
											postAction(auth, { action: "exit" })
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
		</Area>
	)
}
