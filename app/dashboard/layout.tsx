'use client'
import { useThemeDetector } from "@/components/custom/useThemeDetector"
import { useTheme } from "next-themes"
import type React from "react"
import { useEffect } from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
    const { setTheme } = useTheme()
	const theme = useThemeDetector()
	useEffect(() => {
		setTheme(theme ? "dark" : "light")
	}, [theme, setTheme])
    return <>
        {children}
    </>
}