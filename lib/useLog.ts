import useSwr from 'swr'
import { Log } from './api/log'

export function useLog(auth: string) {
    const { data, isLoading, error }: { data: { content: Log[] }, isLoading: boolean, error: any } = useSwr('/api/log', async (url) => {
        return await (await fetch(url, {
            headers: { Authorization: `Basic ${auth}` }
        })).json()
    }, {
        refreshInterval: 3000
    })
    return {
        data,
        isLoading,
        error
    }
}