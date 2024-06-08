import { type AuthData, queryDetails } from "@/lib/api/web"
import useSWR from "swr"

export function useQuery({ url, authData} : { url: string, authData: AuthData}) {
    const { data, isLoading, error } = useSWR(url, async () => {
        return await queryDetails(url, authData)
    })
    return {data, isLoading, error}
}