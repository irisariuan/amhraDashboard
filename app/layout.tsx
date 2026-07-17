import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Amhra Dashboard",
	description: "Customize your Amhra!",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning className="dark">
			<body
				className={`${inter.className} bg-zinc-950 text-zinc-100 h-screen w-screen p-0 m-0`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<main className="h-full w-full">{children}</main>
				</ThemeProvider>
				<Toaster />
			</body>
		</html>
	)
}
