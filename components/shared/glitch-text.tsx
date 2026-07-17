"use client"

import { useEffect, useState } from "react"

const CHARS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

function randomChars(length: number) {
	let result = ""
	for (let i = 0; i < length; i++) {
		result += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
	}
	return result
}

/** Scrambles into the target text one character at a time. */
export function GlitchText({
	children,
	className,
	speed = 50,
}: {
	children: string
	className?: string
	speed?: number
}) {
	const [text, setText] = useState(() => randomChars(children.length))

	useEffect(() => {
		let index = 0
		const interval = setInterval(() => {
			if (index >= children.length) {
				clearInterval(interval)
			}
			setText(children.slice(0, index) + randomChars(children.length - index))
			index++
		}, speed)
		return () => clearInterval(interval)
	}, [children, speed])

	return <span className={className}>{text}</span>
}
