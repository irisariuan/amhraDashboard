'use client'
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"

export type Presentable = number | string

export default function PlaybackControl({
    now,
    totalTime,
    onRelease = () => { },
    enabled = false,
    formatter = (time: number) => `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`
}: {
    now: number
    totalTime: number
    onRelease?: (time: number) => void
    enabled?: boolean
    formatter?: (time: number) => Presentable
}) {
    const ref = useRef<HTMLDivElement>(null)
    const [time, setTime] = useState(now / totalTime)
    const [canBeDragged, setCanBeDragged] = useState(enabled)
    const [mouseDown, setMouseDown] = useState(false)

    function grabbing(mouseXPos: number) {
        if (!ref.current || !canBeDragged) return
        const { left, right } = ref.current?.getBoundingClientRect() ?? { left: 0, right: 0 }
        const time = Math.min(Math.max(mouseXPos, left) - left, right - left) / (right - left)
        setTime(time)
    }
    function dragRelease() {
        setMouseDown(false)
        onRelease(time * totalTime)
    }

    useEffect(() => {
        if (mouseDown) return
        setTime(now / totalTime)
    }, [now, mouseDown, totalTime])

    return (
        <div className="w-full bg-neutral-300 dark:bg-neutral-700 h-4 rounded-full group my-2"
            ref={ref}

            onTouchStart={() => canBeDragged && setMouseDown(true)}
            onTouchMove={(ev) => { canBeDragged && mouseDown && grabbing(ev.touches[0].clientX) }}
            onTouchEnd={dragRelease}
            onTouchCancel={() => { setMouseDown(false) }}

            onMouseDown={() => canBeDragged && setMouseDown(true)}
            onMouseMove={(ev) => { canBeDragged && mouseDown && grabbing(ev.clientX) }}
            onMouseUp={dragRelease}
        >
            {/* <div className="bg-neutral-500 h-2 rounded-full flex items-center justify-end relative" style={{ width: `${time * 100}%` }} ref={ref} /> */}
            <div className="bg-blue-500 dark:bg-neutral-500 h-full rounded-full flex items-center justify-end transform-gpu overflow-visible relative left-0" style={{ width: `${Math.min(time * 100, 100)}%` }}>
                {canBeDragged && (
                    <div className="min-w-2 w-2 h-6 rounded-full bg-blue-600 dark:bg-neutral-100 relative left-1 hover:cursor-grab active:cursor-grabbing flex justify-center">
                        <div className={`min-w-fit relative bottom-8 border border-neutral-500 bg-neutral-100 dark:bg-neutral-800 origin-center p-2 rounded justify-center items-center group-hover:flex ${mouseDown ? 'flex' : 'hidden'} transition-all`}>
                            <Label className="text-neutral-700 dark:text-white font-light select-none">
                                {formatter(time * totalTime)}
                            </Label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
