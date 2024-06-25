import { SongEditType } from "@/lib/api/song"
import { type AuthData, editAction } from "@/lib/api/web"
import { PlusIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"
import { mutate } from "swr"
import { Button } from "@/components/ui/button"
import LinkCard from "./dashboard/link"

export default function HistoryItem({
    link,
    authData,
}: {
    link: string
    authData: AuthData
}) {
    return <div className="break-words w-full flex items-center hover:cursor-pointer gap-2 hover:dark:bg-neutral-900 hover:bg-neutral-200 p-2 rounded-xl">
        <div className="flex-1 overflow-hidden">
            <LinkCard value={link} authData={authData} />
        </div>
        <Button
            variant="outline"
            onClick={async () => {
                if (
                    await editAction(
                        SongEditType.AddSong,
                        authData,
                        link
                    )
                ) {
                    toast('Added song to queue')
                } else {
                    toast('Failed to add song to queue')
                }
                mutate(`/api/song/get/${authData.guildId}`)
            }}
        >
            <PlusIcon />
        </Button>
    </div>
}