import { Label } from '@/components/ui/label'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'
import Query from './query'
import { useQuery } from './useQuery'
import type { AuthData } from '@/lib/api/web'

export default function LinkCard({ value, authData }: { value: string, authData: AuthData }) {
	const { isLoading, data } = useQuery({ url: value, authData })
    return (
        <HoverCard>
            <HoverCardTrigger>
                <a href={value} rel="noreferrer" target='_blank' className='w-4'>
                    <Label className="underline text-blue-500 text-base overflow-hidden hover:cursor-pointer text-ellipsis">
                        {isLoading ? value : data?.title ?? value}
                    </Label>
                </a>
            </HoverCardTrigger>
            <HoverCardContent className="w-full">
                <Query url={value} authData={authData} />
            </HoverCardContent>
        </HoverCard>
    )
}