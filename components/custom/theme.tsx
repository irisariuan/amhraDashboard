'use client'
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { useThemeDetector } from "./useThemeDetector"

export default function Theme() {
    const { setTheme } = useTheme()
    const theme = useThemeDetector()
    useEffect(() => {
        setTheme(theme ? "dark" : "light")
    }, [theme, setTheme])
    return <></>
}