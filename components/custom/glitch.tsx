'use client'

import { useEffect, useState } from "react"

function randomChar(length: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export default function GlitchText({children, className, speed = 50} : {children: string, className?: string, speed?: number} ) {
    const [text, setText] = useState(randomChar(children.length))
    useEffect(() => {
        let index = 0
        const interval = setInterval(() => {
            if (index >= children.length) {
                clearInterval(interval)
            }
            setText(children.slice(0, index) + randomChar(children.length - index))
            index++
        }, speed);
        return () => clearInterval(interval)
    }, [children, speed])
    return (
        <span className={className}>{text}</span>
    )
}