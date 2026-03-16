'use client'

import useSWR from 'swr'
import type { DailyNewsResponse } from '@/lib/daily-news-types'

const fetcher = async (url: string) => {
	const response = await fetch(url)
	if (!response.ok) {
		throw new Error('Failed to load daily news')
	}

	return (await response.json()) as DailyNewsResponse
}

export function useDailyNews() {
	const { data, error, isLoading, mutate } = useSWR<DailyNewsResponse>('/api/daily-news', fetcher, {
		refreshInterval: 2 * 60 * 60 * 1000,
		revalidateOnFocus: false,
		revalidateOnReconnect: false,
		revalidateIfStale: false,
		keepPreviousData: true,
		dedupingInterval: 30 * 60 * 1000
	})

	return {
		data,
		error,
		isLoading,
		mutate
	}
}
