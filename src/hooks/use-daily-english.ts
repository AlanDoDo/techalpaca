'use client'

import useSWR from 'swr'
import type { DailyEnglishResponse } from '@/lib/daily-english-types'

const fetcher = async (url: string) => {
	const response = await fetch(url, { cache: 'no-store' })
	if (!response.ok) {
		throw new Error('Failed to load daily English')
	}

	return (await response.json()) as DailyEnglishResponse
}

export function useDailyEnglish() {
	const { data, error, isLoading, mutate } = useSWR<DailyEnglishResponse>('/api/daily-english', fetcher, {
		refreshInterval: 6 * 60 * 60 * 1000,
		revalidateOnFocus: false,
		dedupingInterval: 5 * 60 * 1000
	})

	return {
		data,
		error,
		isLoading,
		mutate
	}
}
