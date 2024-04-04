import { Progress } from "@/components/ui/progress"

export default function Timeline({ value, fullValue } : {value: number, fullValue: number}) {
    return (
        <Progress value={value / fullValue * 100} />
    )
}