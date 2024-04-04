'use client'
import { useThemeDetector } from "@/components/custom/useThemeDetector"
import { useTheme } from "next-themes"
import type React from "react"
import { useEffect } from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme()
    const deviceTheme = useThemeDetector()
    useEffect(() => {
        setTheme(deviceTheme ? 'dark' : 'light')
        console.log(deviceTheme)
    }, [deviceTheme, setTheme])
    return <>
        {children}
    </>
}