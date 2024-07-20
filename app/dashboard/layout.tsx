'use client'
import type React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        {children}
    </>
}