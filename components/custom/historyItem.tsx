import { SongEditType } from "@/lib/api/song"
import { editAction } from "@/lib/api/web"
import { PlusIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import LinkCard from "./dashboard/link"

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
    return <div className="break-words w-full flex items-center hover:cursor-pointer gap-2">
        <div className="flex-1 overflow-hidden">
            <LinkCard value={link} auth={auth} visitor={visitor} />
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