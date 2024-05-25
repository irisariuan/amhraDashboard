import { Label } from '@/components/ui/label'
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card'
import Query from './query'
import { useQuery } from './useQuery'

export default function LinkCard({ value, auth, visitor }: { value: string, auth: string, visitor: boolean }) {
	const { isLoading, data } = useQuery({ url: value, auth, visitor })
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
                <Query url={value} visitor={visitor} auth={auth} />
            </HoverCardContent>
        </HoverCard>
    )
}