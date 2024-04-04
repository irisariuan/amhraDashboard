'use client'
import { useState, useEffect } from "react"

export function useThemeDetector() {
    const [isDarkTheme, setIsDarkTheme] = useState(false)
    useEffect(() => {
        const mqListener = (e: MediaQueryListEvent) => {
            setIsDarkTheme(e.matches)
        }
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)")
        if (darkThemeMq.matches) {
            setIsDarkTheme(true)
        }
        darkThemeMq.addEventListener('change', mqListener)
        return () => darkThemeMq.removeEventListener('change', mqListener)
    }, [])
    return isDarkTheme
}