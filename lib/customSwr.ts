import useSWR from 'swr'
import { Log } from './api/log'
import { getLog } from './api/web'

export function useLog(auth: string) {
    const { data, isLoading, error }: { data: { content: Log[] } | undefined, isLoading: boolean, error: any } = useSWR('/api/log', async () => {
        return await getLog(auth)
    }, {
        refreshInterval: 3000
    })
    return {
        data,
        isLoading,
        error
    }
}