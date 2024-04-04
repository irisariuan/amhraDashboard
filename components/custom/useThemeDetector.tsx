'use client'
import { useState, useEffect, useCallback } from "react"

export function useThemeDetector() {
    const [isDarkTheme, setIsDarkTheme] = useState(false)
    const mqListener = useCallback((e: MediaQueryListEvent) => {
        setIsDarkTheme(e.matches)
    }, [])
    useEffect(() => {
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)")
        darkThemeMq.addEventListener('change', mqListener)
        return () => darkThemeMq.removeEventListener('change', mqListener)
    }, [mqListener])
    return isDarkTheme
}