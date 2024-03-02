import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Amhra Dashboard",
	description: "Customize your Amhra!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-blue-500 h-screen w-screen p-0 m-0`}>
				<main className="h-full w-full">
					{children}
				</main>
				<Toaster />
			</body>
		</html>
	);
}
