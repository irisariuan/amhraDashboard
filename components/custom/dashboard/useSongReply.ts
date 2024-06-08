import type { SongReply } from "@/lib/api/song";
import useSWR from "swr";

export function useSongReply({ guildId, auth, visitor, bearer = false, refreshInterval = 2000 }: { guildId: string, auth: string, visitor: boolean, bearer: boolean, refreshInterval?: number }) {
    const { data, isLoading }: { data: SongReply | null, isLoading: boolean } =
        useSWR(`/api/song/get/${guildId}`, async url => {
            return await (
                await fetch(url, {
                    headers: {
                        Authorization: visitor ? auth : `${bearer ? 'Bearer' : 'Basic'} ${auth}`,
                    },
                })
            ).json()
        }, { refreshInterval })
    return { data, isLoading }
}