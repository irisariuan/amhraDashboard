'use client'
import Controllable, { type Presentable } from "./controllableBar"

export default function PlaybackControl({
    now,
    totalTime,
    onRelease,
    enabled = true,
}: {
    now: number
    totalTime: number
    onRelease?: (time: number) => void
    enabled?: boolean
    formatter?: (time: number) => Presentable
}) {
    return <Controllable onRelease={onRelease} enabled={enabled} now={now} totalValue={totalTime} formatter={(time: number) => `${Math.floor(time / 60).toString().padStart(2, '0')}:${Math.floor(time % 60).toString().padStart(2, '0')}`} />
}
