'use client'

import { toast } from 'sonner'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { putFile, readTextFileFromRepo, toBase64Utf8 } from '@/lib/github-client'
import type { ConfirmedDailyEnglishEntry } from '@/lib/daily-english-types'

const CONFIRMED_DAILY_ENGLISH_PATH = 'src/config/daily-english-confirmed.json'

function dedupeConfirmedEntries(entries: ConfirmedDailyEnglishEntry[]) {
	const seen = new Set<string>()

	return entries.filter(entry => {
		const key = `${entry.english}__${entry.translation}`
		if (seen.has(key)) return false
		seen.add(key)
		return true
	})
}

export async function pushConfirmedDailyEnglish(entry: ConfirmedDailyEnglishEntry) {
	const token = await getAuthToken()

	toast.info('正在读取仓库中的已确认句库...')
	const existingText = await readTextFileFromRepo(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, CONFIRMED_DAILY_ENGLISH_PATH, GITHUB_CONFIG.BRANCH)

	let currentEntries: ConfirmedDailyEnglishEntry[] = []
	if (existingText) {
		try {
			const parsed = JSON.parse(existingText)
			if (Array.isArray(parsed)) {
				currentEntries = parsed as ConfirmedDailyEnglishEntry[]
			}
		} catch (error) {
			console.error('Failed to parse confirmed daily english file:', error)
		}
	}

	const alreadyExists = currentEntries.some(item => item.english === entry.english && item.translation === entry.translation)
	if (alreadyExists) {
		return {
			alreadyExists: true,
			entries: currentEntries
		}
	}

	const nextEntries = dedupeConfirmedEntries([entry, ...currentEntries])

	toast.info('正在把句子写入仓库...')
	await putFile(
		token,
		GITHUB_CONFIG.OWNER,
		GITHUB_CONFIG.REPO,
		CONFIRMED_DAILY_ENGLISH_PATH,
		toBase64Utf8(JSON.stringify(nextEntries, null, '\t')),
		'feat: confirm daily english sentence',
		GITHUB_CONFIG.BRANCH
	)

	return {
		alreadyExists: false,
		entries: nextEntries
	}
}
