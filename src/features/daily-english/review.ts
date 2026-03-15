import type { DailyEnglishEntry } from './data'

export interface DailyEnglishReviewRecord {
	level: number
	seenCount: number
	lastReviewedOn: string
	nextReviewOn: string
	lastFeedback: 'good' | 'again'
}

export type DailyEnglishReviewState = Record<string, DailyEnglishReviewRecord>
export type DailyEnglishReviewFeedback = 'good' | 'again'

const REVIEW_STORAGE_KEY = 'daily-english-review-state-v1'
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60] as const

function pad(value: number) {
	return value.toString().padStart(2, '0')
}

export function toDateKey(date: Date = new Date()) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fromDateKey(dateKey: string) {
	const [year, month, day] = dateKey.split('-').map(Number)
	return new Date(year, (month || 1) - 1, day || 1)
}

function addDays(dateKey: string, days: number) {
	const date = fromDateKey(dateKey)
	date.setDate(date.getDate() + days)
	return toDateKey(date)
}

export function readDailyEnglishReviewState(): DailyEnglishReviewState {
	if (typeof window === 'undefined') return {}

	try {
		const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY)
		if (!raw) return {}

		const parsed = JSON.parse(raw)
		if (!parsed || typeof parsed !== 'object') return {}

		return parsed as DailyEnglishReviewState
	} catch {
		return {}
	}
}

export function writeDailyEnglishReviewState(state: DailyEnglishReviewState) {
	if (typeof window === 'undefined') return
	window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(state))
}

export function ensureDailyEnglishSeen(state: DailyEnglishReviewState, entryId: string, date: Date = new Date()): DailyEnglishReviewState {
	if (state[entryId]) return state

	const todayKey = toDateKey(date)
	return {
		...state,
		[entryId]: {
			level: 0,
			seenCount: 1,
			lastReviewedOn: todayKey,
			nextReviewOn: addDays(todayKey, REVIEW_INTERVALS[0]),
			lastFeedback: 'good'
		}
	}
}

export function reviewDailyEnglishEntry(
	state: DailyEnglishReviewState,
	entryId: string,
	feedback: DailyEnglishReviewFeedback,
	date: Date = new Date()
): DailyEnglishReviewState {
	const seededState = ensureDailyEnglishSeen(state, entryId, date)
	const current = seededState[entryId]
	const todayKey = toDateKey(date)
	const nextLevel = feedback === 'good' ? Math.min(current.level + 1, REVIEW_INTERVALS.length - 1) : Math.max(current.level - 1, 0)
	const nextReviewOn = addDays(todayKey, feedback === 'good' ? REVIEW_INTERVALS[nextLevel] : 1)

	return {
		...seededState,
		[entryId]: {
			level: nextLevel,
			seenCount: current.seenCount + 1,
			lastReviewedOn: todayKey,
			nextReviewOn,
			lastFeedback: feedback
		}
	}
}

export function getDueDailyEnglishEntries(entries: DailyEnglishEntry[], state: DailyEnglishReviewState, date: Date = new Date(), limit = 4) {
	const todayKey = toDateKey(date)

	return entries
		.filter(entry => {
			const record = state[entry.id]
			return record && record.nextReviewOn <= todayKey
		})
		.sort((a, b) => {
			const aDate = state[a.id]?.nextReviewOn || ''
			const bDate = state[b.id]?.nextReviewOn || ''
			return aDate.localeCompare(bDate)
		})
		.slice(0, limit)
}

export function getDailyEnglishReviewStats(state: DailyEnglishReviewState, date: Date = new Date()) {
	const todayKey = toDateKey(date)
	const records = Object.values(state)

	return {
		studied: records.length,
		due: records.filter(record => record.nextReviewOn <= todayKey).length,
		mastered: records.filter(record => record.level >= 4).length
	}
}

export function getDailyEnglishReviewLabel(record?: DailyEnglishReviewRecord) {
	if (!record) return '未开始'
	if (record.level >= 4) return '掌握中'
	if (record.level >= 2) return '复习中'
	return '刚学过'
}
