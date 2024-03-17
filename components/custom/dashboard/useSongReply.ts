import { SongReply } from "@/lib/api/song";
import useSWR from "swr";

export function useSongReply({ guildId, auth }: { guildId: string, auth: string }) {
    const { data, isLoading }: { data: SongReply | null, isLoading: boolean } =
        useSWR("/api/song/get/" + guildId, async url => {
            return await (
                await fetch(url, {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                })
            ).json()
        })
    return { data, isLoading }
}