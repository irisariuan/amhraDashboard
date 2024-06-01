'use client'
import { useEffect, useRef, useState } from "react"
import type { MouseEvent, TouchEvent } from "react"

export default function PlaybackControl({
    now,
    totalTime,
    onRelease = () => { },
    enabled = false
}: {
    now: number
    totalTime: number
    onRelease?: (time: number) => void
    enabled?: boolean

}) {
    const ref = useRef<HTMLDivElement>(null)
    const [time, setTime] = useState(now / totalTime)
    const [mouseDown, setMouseDown] = useState(false)

    function grabbing(mouseXPos: number) {
        if (!ref.current || !enabled) return
        const { left, right } = ref.current?.getBoundingClientRect() ?? { left: 0, right: 0 }
        const time = (mouseXPos - left) / (right - left)
        setTime(time)
    }

    useEffect(() => {
        if (mouseDown) return
        setTime(now / totalTime)
    }, [now, mouseDown, totalTime])

    return (
        <div className="w-full bg-neutral-700 h-2 rounded-full" ref={ref}
            onTouchStart={() => enabled && setMouseDown(true)}
            onTouchMove={(ev) => { enabled && mouseDown && grabbing(ev.touches[0].clientX)}}
            onTouchEnd={() => { setMouseDown(false); onRelease(time * totalTime) }}
        
            onMouseDown={() => enabled && setMouseDown(true)}
            onMouseMove={(ev) => { enabled && mouseDown && grabbing(ev.clientX) }}
            onMouseUp={() => { setMouseDown(false); onRelease(time * totalTime) }}
        >
            {/* <div className="bg-neutral-500 h-2 rounded-full flex items-center justify-end relative" style={{ width: `${time * 100}%` }} ref={ref} /> */}
            <div className="bg-neutral-500 h-2 rounded-full flex items-center justify-end" style={{ width: `${time * 100}%` }} ref={ref}>
                {enabled && (
                    <div className="w-2 h-5 rounded-full bg-neutral-100 relative left-1 hover:cursor-grab active:cursor-grabbing" />
                )}
            </div>
        </div>
    )
}
