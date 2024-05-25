import { SongEditType } from "@/lib/api/song"
import { editAction } from "@/lib/api/web"
import { PlusIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Label } from "../ui/label"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import Query from "./dashboard/query"
import { useQuery } from "./dashboard/useQuery"

export default function HistoryItem({
    link,
    auth,
    guildId,
    visitor,
}: {
    link: string
    auth: string
    guildId: string
    visitor: boolean
}) {
    const { data, isLoading } = useQuery({ url: link, auth, visitor })
    return <div className="break-words w-full flex items-center hover:cursor-pointer gap-2">
        <div className="flex-1 overflow-hidden">
            <HoverCard>
                <HoverCardTrigger>
                    <a href={link} rel="noreferrer" target='_blank' className='w-4'>
                        <Label className="underline text-blue-500 text-base overflow-hidden hover:cursor-pointer text-ellipsis">
                            {isLoading ? link : data?.title ?? link}
                        </Label>
                    </a>
                </HoverCardTrigger>
                <HoverCardContent className="w-full">
                    <Query url={link} visitor={visitor} auth={auth} />
                </HoverCardContent>
            </HoverCard>
        </div>
        <Button
            variant="outline"
            onClick={async () => {
                if (
                    await editAction(
                        auth,
                        SongEditType.AddSong,
                        guildId,
                        visitor,
                        link
                    )
                ) {
                    toast('Added song to queue')
                } else {
                    toast('Failed to add song to queue')
                }
                mutate(`/api/song/get/${guildId}`)
            }}
        >
            <PlusIcon />
        </Button>
    </div>
}