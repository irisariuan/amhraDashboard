'use client'
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"

export type Presentable = number | string

export default function Controllable({
    now,
    totalValue,
    onRelease = () => { },
    enabled = false,
    formatter
}: {
    now: number
    totalValue: number
    onRelease?: (value: number) => void
    enabled?: boolean
    formatter: (value: number) => Presentable
}) {
    const ref = useRef<HTMLDivElement>(null)
    const previewRef = useRef<HTMLDivElement>(null)
    const [value, setValue] = useState(now / totalValue)
    const [mouseDown, setMouseDown] = useState(false)
    const [previewValue, setPreviewValue] = useState(10)

    function grabbing(mouseXPos: number) {
        if (!ref.current || !enabled) return
        const { left, right } = ref.current?.getBoundingClientRect() ?? { left: 0, right: 0 }
        const nowValue = Math.min(Math.max(mouseXPos, left) - left, right - left) / (right - left)
        setValue(nowValue)
    }
    function mouseMoving(mouseXPos: number) {
        if (!previewRef.current || !enabled) return
        const { left, right } = previewRef.current?.getBoundingClientRect() ?? { left: 0, right: 0 }
        const nowValue = Math.min(Math.max(mouseXPos, left) - left, right - left) / (right - left)
        setPreviewValue(nowValue)
    }
    function dragRelease() {
        setMouseDown(false)
        onRelease(value * totalValue)
    }

    useEffect(() => {
        if (mouseDown) return
        setValue(now / totalValue)
    }, [now, mouseDown, totalValue])

    return (
        <div className="w-full bg-neutral-300 dark:bg-neutral-700 h-4 rounded-full group my-2"
            ref={ref}

            onTouchStart={() => enabled && setMouseDown(true)}
            onTouchMove={(ev) => enabled && mouseDown && grabbing(ev.touches[0].clientX)}
            onTouchEnd={dragRelease}
            onTouchCancel={() => { setMouseDown(false) }}

            onMouseDown={() => enabled && setMouseDown(true)}
            onMouseMove={(ev) => enabled && mouseDown && grabbing(ev.clientX)}
            onMouseUp={dragRelease}
        >
            <div className="bg-blue-500 dark:bg-neutral-500 h-full rounded-full flex items-center justify-end transform-gpu overflow-visible relative left-0 z-0" style={{ width: `${Math.min(value * 100, 100)}%` }}>
                {enabled && (
                    <div className="min-w-2 w-2 h-6 rounded-full bg-blue-600 dark:bg-neutral-100 relative left-1 hover:cursor-grab active:cursor-grabbing flex justify-center z-0">
                        <div className={`min-w-fit relative bottom-8 border border-neutral-500 bg-neutral-100 dark:bg-neutral-800 origin-center p-2 rounded justify-center items-center group-hover:flex ${mouseDown ? 'flex' : 'hidden'} transition-all`}>
                            <Label className="text-neutral-700 dark:text-white font-light select-none">
                                {formatter(value * totalValue)}
                            </Label>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative h-4 bottom-4 rounded-full items-center flex w-full" ref={previewRef} onMouseMove={v => enabled && !mouseDown && mouseMoving(v.clientX)}>
                {enabled && !mouseDown && (
                    <div className="w-full flex justify-end items-center z-50 h-4 rounded-full transform" style={{ width: `${Math.min(previewValue * 100, 100)}%` }}>
                        <div className="min-w-2 w-2 h-6 rounded-full bg-neutral-400 dark:bg-neutral-600 relative hover:cursor-grab active:cursor-grabbing invisible group-hover:visible flex justify-center left-1">
                            <div className="min-w-fit relative bottom-8 border border-neutral-500 bg-neutral-200 dark:bg-neutral-900 origin-center p-2 rounded justify-center items-center flex">
                                <Label className="text-neutral-500 font-light select-none">
                                    {formatter(previewValue * totalValue)}
                                </Label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
