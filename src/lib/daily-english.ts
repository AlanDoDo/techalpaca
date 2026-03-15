import confirmedDailyEnglish from '@/config/daily-english-confirmed.json'
import { DAILY_ENGLISH_ENTRIES, type DailyEnglishEntry } from '@/features/daily-english/data'
import type { ConfirmedDailyEnglishEntry, DailyEnglishResponse } from './daily-english-types'

export const DAILY_ENGLISH_REVALIDATE_SECONDS = 21600

const DAILY_ENGLISH_EPOCH = '2026-01-01'
const TATOEBA_API_URL = 'https://api.tatoeba.org/unstable/sentences'

interface TatoebaTranslation {
	text: string
	lang: string
	script: string | null
	is_direct?: boolean
}

interface TatoebaSentence {
	id: number
	text: string
	owner: string
	license: string
	translations?: TatoebaTranslation[]
}

interface TatoebaSentenceResponse {
	data?: TatoebaSentence[]
}

function buildTatoebaSourceUrl() {
	const url = new URL(TATOEBA_API_URL)
	url.searchParams.set('lang', 'eng')
	url.searchParams.set('trans:lang', 'cmn')
	url.searchParams.set('limit', '18')
	url.searchParams.set('sort', 'created')
	return url.toString()
}

function pad(value: number) {
	return value.toString().padStart(2, '0')
}

function toDateKey(date: Date = new Date()) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function diffDays(from: string, to: string) {
	const [fromYear, fromMonth, fromDay] = from.split('-').map(Number)
	const [toYear, toMonth, toDay] = to.split('-').map(Number)
	const fromDate = new Date(fromYear, (fromMonth || 1) - 1, fromDay || 1)
	const toDate = new Date(toYear, (toMonth || 1) - 1, toDay || 1)
	return Math.floor((toDate.getTime() - fromDate.getTime()) / 86400000)
}

function getDailyIndex(count: number, date: Date = new Date()) {
	if (count <= 0) return 0
	const offset = Math.max(0, diffDays(DAILY_ENGLISH_EPOCH, toDateKey(date)))
	return offset % count
}

function rotateEntries<T>(entries: T[], date: Date = new Date()) {
	if (entries.length === 0) return entries
	const dailyIndex = getDailyIndex(entries.length, date)
	return [...entries.slice(dailyIndex), ...entries.slice(0, dailyIndex)]
}

function buildPronunciation(text: string) {
	return text
		.replace(/[^a-zA-Z0-9' -]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase()
}

function buildScenario(text: string) {
	const lower = text.toLowerCase()

	if (lower.includes("let's") || lower.includes('we ')) {
		return '适合协作、商量安排，或者在团队沟通里自然开口。'
	}

	if (text.includes('?')) {
		return '适合提问、确认信息，或者把对话继续往前推进。'
	}

	if (lower.includes('you ')) {
		return '适合对别人做提醒、回应，或者把话说得更直接自然。'
	}

	return '适合在日常交流里表达状态、判断或简单事实。'
}

function buildReflection(text: string) {
	const lower = text.toLowerCase()

	if (text.includes('?')) {
		return '这类句子练习时，不要只背单词，重点是把疑问语气和停顿一起模仿出来。'
	}

	if (lower.includes("let's") || lower.includes('we ')) {
		return '这类句子很适合练“拉别人一起行动”的语气，先整句跟读，再替换其中一个动词会更快上口。'
	}

	if (lower.includes('i ')) {
		return '这类句子适合从“我自己的表达模板”开始积累，先照着说顺，再替换自己的真实场景。'
	}

	return '我更偏向先记整句，再理解细节。先让嘴巴会说，语言感通常会比语法分析来得更快。'
}

function buildTags(text: string) {
	const lower = text.toLowerCase()

	if (text.includes('?')) return ['提问', '对话', '口语']
	if (lower.includes("let's") || lower.includes('we ')) return ['协作', '表达', '口语']
	if (lower.includes('i ')) return ['自我表达', '日常', '口语']
	return ['日常交流', '句型', '口语']
}

function dedupeEntries(entries: DailyEnglishEntry[]) {
	const seen = new Set<string>()
	return entries.filter(entry => {
		const key = `${entry.english}__${entry.translation}`
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}

function sanitizeConfirmedEntries(input: unknown): ConfirmedDailyEnglishEntry[] {
	if (!Array.isArray(input)) return []

	return input.filter((item): item is ConfirmedDailyEnglishEntry => {
		if (!item || typeof item !== 'object') return false

		const entry = item as Partial<ConfirmedDailyEnglishEntry>
		return (
			typeof entry.id === 'string' &&
			typeof entry.english === 'string' &&
			typeof entry.translation === 'string' &&
			typeof entry.scenario === 'string' &&
			typeof entry.reflection === 'string' &&
			typeof entry.pronunciation === 'string' &&
			Array.isArray(entry.tags) &&
			typeof entry.confirmedAt === 'string'
		)
	})
}

function getConfirmedEntries(date: Date = new Date()) {
	return rotateEntries(sanitizeConfirmedEntries(confirmedDailyEnglish), date)
}

function mapRemoteEntry(sentence: TatoebaSentence): DailyEnglishEntry | null {
	const translation = sentence.translations?.find(item => item.lang === 'cmn' || item.lang === 'zho')?.text?.trim()
	const english = sentence.text?.trim()

	if (!english || !translation) return null

	return {
		id: `tatoeba-${sentence.id}`,
		english,
		translation,
		scenario: buildScenario(english),
		reflection: buildReflection(english),
		pronunciation: buildPronunciation(english),
		tags: buildTags(english)
	}
}

function buildFallbackResponse(date: Date = new Date()): DailyEnglishResponse {
	const confirmed = getConfirmedEntries(date)
	const history = rotateEntries(DAILY_ENGLISH_ENTRIES, date)
	return {
		current: history[0],
		history,
		confirmed,
		updatedAt: new Date().toISOString(),
		source: {
			label: 'Local Fallback',
			url: buildTatoebaSourceUrl(),
			fallback: true
		}
	}
}

export async function getDailyEnglish(date: Date = new Date()): Promise<DailyEnglishResponse> {
	const confirmed = getConfirmedEntries(date)

	try {
		const requestUrl = buildTatoebaSourceUrl()

		const response = await fetch(requestUrl, {
			headers: {
				accept: 'application/json'
			},
			next: {
				revalidate: DAILY_ENGLISH_REVALIDATE_SECONDS
			}
		})

		if (!response.ok) {
			throw new Error(`Daily English API failed: ${response.status}`)
		}

		const payload = (await response.json()) as TatoebaSentenceResponse
		const remoteEntries = dedupeEntries((payload.data ?? []).map(mapRemoteEntry).filter((entry): entry is DailyEnglishEntry => Boolean(entry)))

		if (remoteEntries.length < 6) {
			throw new Error('Daily English API returned too few entries')
		}

		const history = rotateEntries(remoteEntries, date)
		return {
			current: history[0],
			history,
			confirmed,
			updatedAt: new Date().toISOString(),
			source: {
				label: 'Tatoeba Official API',
				url: requestUrl,
				fallback: false
			}
		}
	} catch {
		return buildFallbackResponse(date)
	}
}
