"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { FaDiscord } from "react-icons/fa"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api/auth"
import { storeSession } from "@/lib/session"

const formSchema = z.object({
	password: z.string().min(1),
})

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default function LoginPage(props: { searchParams: SearchParams }) {
	const searchParams = use(props.searchParams)
	const router = useRouter()
	const [submitting, setSubmitting] = useState(false)
	const [isChecked, setChecked] = useState(searchParams?.checked === "true")

	// Auto-login with a stored admin password, then strip any search params.
	useEffect(() => {
		;(async () => {
			const key = window.localStorage.getItem("key")
			if (key && (await login({ type: "admin", token: key }))) {
				window.localStorage.removeItem("bearer")
				router.push("/dashboard")
			}
		})()
		router.replace("/login")
	}, [router])

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { password: "" },
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const session = { type: "admin", token: values.password } as const
		if (await login(session)) {
			storeSession(session)
			setSubmitting(true)
			router.push("/dashboard")
			return
		}
		toast("Failed to login", {
			closeButton: true,
			description: "Please try again",
		})
	}

	return (
		<div className="h-full w-full flex flex-col items-center justify-center">
			<div className="bg-white dark:bg-zinc-900 h-max w-max p-10 rounded-xl flex flex-col justify-center items-center text-3xl gap-2">
				<h1 className="font-extrabold mb-6">Amhra Dashboard</h1>
				<div className="flex gap-2 items-center">
					<p className="text-base">
						I agree to{" "}
						<Link href="/terms" className="text-blue-400 underline">
							Terms of Service
						</Link>
					</p>
					<input
						type="checkbox"
						checked={isChecked}
						onChange={ev => setChecked(ev.target.checked)}
					/>
				</div>
				{isChecked && (
					<>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="w-full"
							>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xl">
												Admin Login
											</FormLabel>
											<FormControl>
												<Input
													placeholder="Password"
													{...field}
													type="password"
													className="text-large font-light"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									disabled={submitting}
									className="text-xl w-full mt-2"
								>
									Login
								</Button>
							</form>
						</Form>
						<Link
							className="w-full bg-discord hover:bg-discord-dark font-bold text-white flex justify-center items-center gap-2 rounded-md p-2 text-lg"
							href="/discord"
						>
							<FaDiscord />
							Login With Discord
						</Link>
						<Link
							href="/invite"
							className="text-base text-gray-500 underline"
						>
							Not a user? Add it to your server
						</Link>
					</>
				)}
			</div>
		</div>
	)
}
