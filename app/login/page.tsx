"use client"
import { login } from "@/lib/api/web"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button, ButtonProps } from "@/components/ui/button"
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

const formSchema = z.object({
	password: z.string().min(1),
})

export default function LoginPage() {
	const router = useRouter()
	const buttonRef = useRef<null | any>(null)
	useEffect(() => {
		; (async () => {
			const item = window.localStorage.getItem("key")
			if (item) {
				if (await login(item)) {
					return router.push("/dashboard")
				}
			}
		})()
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
	return (
		<div className="h-full w-full flex flex-col items-center justify-center">
			<div className="bg-white h-fit w-min-1/2 p-10 rounded-xl flex flex-col justify-center items-center text-3xl">
				<h1 className="font-extrabold mb-8">Amhra</h1>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="">
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
						<Button ref={buttonRef} type="submit" className="text-xl px-8 mt-4">
							Login
						</Button>
					</form>
				</Form>
			</div>
		</div>
	)
}
