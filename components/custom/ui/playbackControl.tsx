'use client'
import { useEffect, useRef, useState } from "react"
import type { MouseEvent } from "react"

export default function PlaybackControl({
    now,
    totalTime,
    enabled = false
}: {
    now: number
    totalTime: number
    enabled?: boolean

}) {
    const ref = useRef<HTMLDivElement>(null)
    const [time, setTime] = useState(now / totalTime)
    const [mouseDown, setMouseDown] = useState(false)
    
    function grabbing(event: MouseEvent<HTMLDivElement>) {
        if (!ref.current || !mouseDown || !enabled) return
        const { clientX } = event
        const { left, right } = ref.current?.getBoundingClientRect() ?? { left: 0, right: 0 }
        const time = (clientX - left) / (right - left)
        setTime(time)
    }

    useEffect(() => {
        if (mouseDown) return
        console.log(now, totalTime)
        setTime(now / totalTime)
    }, [now, mouseDown, totalTime])

    return (
        <div className="w-full bg-neutral-700 h-2 rounded-full overflow-hidden" ref={ref} onMouseDown={() => enabled && setMouseDown(true)} onMouseUp={() => setMouseDown(false)} onMouseMove={grabbing}>
            <div className="bg-neutral-500 h-2 rounded-full flex items-center justify-end" style={{ width: `${time * 100}%` }} ref={ref}>
                {enabled && (
                    <div className="w-2 h-5 rounded-full bg-neutral-100 translate-x-2 hover:cursor-grab active:cursor-grabbing" />
                )}
            </div>
        </div>
    )
}
