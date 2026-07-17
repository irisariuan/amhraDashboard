"use client"
import { toast } from "sonner"
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
import { postAction } from "@/lib/api/settings"

/** Admin controls: reload and terminate the bot. */
export function AdminView() {
	return (
		<div className="max-w-lg">
			<h2 className="text-2xl font-bold mb-6">Administration</h2>
			<div className="flex flex-col gap-3">
				<Button
					variant="secondary"
					onClick={async () =>
						toast((await postAction("reload")) ? "Reloaded commands" : "Failed")
					}
				>
					Reload commands
				</Button>
				<Button
					variant="secondary"
					onClick={async () =>
						toast(
							(await postAction("reloadSetting"))
								? "Reloaded settings"
								: "Failed",
						)
					}
				>
					Reload settings
				</Button>
				<Dialog>
					<DialogTrigger asChild>
						<Button variant="destructive">Terminate bot</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Are you absolutely sure?</DialogTitle>
							<DialogDescription>
								This shuts the bot down immediately for every guild.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter className="gap-2">
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<DialogClose asChild>
								<Button
									variant="destructive"
									onClick={() => postAction("exit")}
								>
									Terminate
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
