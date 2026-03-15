import type { DailyEnglishEntry } from '@/features/daily-english/data'

export interface ConfirmedDailyEnglishEntry extends DailyEnglishEntry {
	confirmedAt: string
	sourceLabel?: string
	sourceUrl?: string
	sourceFallback?: boolean
}

export interface DailyEnglishResponse {
	current: DailyEnglishEntry
	history: DailyEnglishEntry[]
	confirmed: ConfirmedDailyEnglishEntry[]
	updatedAt: string
	source: {
		label: string
		url: string
		fallback: boolean
	}
}
