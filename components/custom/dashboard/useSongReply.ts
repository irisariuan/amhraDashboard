import { SongReply } from "@/lib/api/song";
import useSWR from "swr";

export function useSongReply({ guildId, auth, visitor }: { guildId: string, auth: string, visitor: boolean}) {
    const { data, isLoading }: { data: SongReply | null, isLoading: boolean } =
        useSWR("/api/song/get/" + guildId, async url => {
            return await (
                await fetch(url, {
                    headers: {
                        Authorization: visitor ? auth : `Basic ${auth}`,
                    },
                })
            ).json()
        })
    return { data, isLoading }
}