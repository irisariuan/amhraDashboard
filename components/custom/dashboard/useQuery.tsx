import { queryDetails } from "@/lib/api/web"
import useSWR from "swr"

export function useQuery({ url, auth, visitor} : { url: string, auth: string, visitor: boolean}) {
    const { data, isLoading, error } = useSWR(url, async () => {
        return await queryDetails(auth, url, visitor)
    })
    return {data, isLoading, error}
}