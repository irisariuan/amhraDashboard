"use client"
import { login } from "@/lib/api/web"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord } from '@fortawesome/free-brands-svg-icons'
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
	password: z.string().min(1),
})

export default function LoginPage({searchParams} : {searchParams: {[key: string]: string | string[] | undefined}}) {
	const router = useRouter()
	const buttonRef = useRef<null | HTMLButtonElement>(null)
	useEffect(() => {
		; (async () => {
			const item = window.localStorage.getItem("key")
			const bearer = window.localStorage.getItem("bearer")
			if (item) {
				if (await login(item)) {
					if (bearer) {
						window.localStorage.removeItem("bearer")
					}
					return router.push("/dashboard")
				}
			}
			// if (bearer) {
			// 	if (await login(bearer, { bearer: true })) {
			// 		return router.push("/dashboard")
			// 	}
			// }
		})()
		router.replace('/login')
	}, [router])
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
		},
	})

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (await login(values.password)) {
			window.localStorage.setItem("key", values.password)
			window.localStorage.removeItem("bearer")
			router.push("/dashboard")
			if (!buttonRef.current) return
			buttonRef.current.disabled = true
			return
		}
		toast('Failed to login', {
			closeButton: true,
			important: true,
			description: 'Please try again'
		})
	}


	const [isChecked, setChecked] = useState(searchParams?.checked === 'true')

	return (
		<div className="h-full w-full flex flex-col items-center justify-center">
			<div className="bg-white dark:bg-zinc-900 h-max w-max p-10 rounded-xl flex flex-col justify-center items-center text-3xl gap-2">
				<h1 className="font-extrabold mb-6">Amhra Dashboard</h1>
				<div className="flex gap-2 items-center">
					<p className="text-base">I agree to <Link href='/terms' className="text-blue-400 underline">Terms of Service</Link></p>
					<input type="checkbox" checked={isChecked} onChange={ev => { setChecked(ev.target.checked) }} />
				</div>
				{
					isChecked &&
					<>
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem className="">
											<FormLabel className="text-xl">Password</FormLabel>
											<FormControl className="">
												<Input
													placeholder="Password"
													{...field}
													type="password"
													className="text-large font-light"
												/>
											</FormControl>
											<FormDescription className="">
												Login Dashboard
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button ref={buttonRef} type="submit" className="text-xl w-full">
									Login
								</Button>
							</form>
						</Form>
						<Link className="w-full bg-discord hover:bg-discord-dark font-bold text-white flex justify-center items-center gap-2 rounded-md p-2 text-lg" href="/discord">
							<FontAwesomeIcon icon={faDiscord} />
							Login With Discord
						</Link>
					</>
				}
			</div>
		</div>
	)
}
