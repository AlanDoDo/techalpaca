import type { DailyNewsAggregateItem, DailyNewsResponse, DailyNewsSourceItem, DailyNewsSourceKey, DailyNewsSourceMeta } from './daily-news-types'

const TWO_HOURS = 60 * 60 * 2
const FETCH_TIMEOUT_MS = 8000
const DEFAULT_LIMIT = 12
const NEWS_USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 TechAlpacaNewsBot/1.0'

type FetchAttempt = () => Promise<DailyNewsSourceItem[]>

type LooseRecord = Record<string, any>

interface DailyNewsSourceConfig extends DailyNewsSourceMeta {
	attempts: FetchAttempt[]
}

const SOURCE_META: Record<DailyNewsSourceKey, DailyNewsSourceMeta> = {
	zhihu: {
		key: 'zhihu',
		label: '\u77e5\u4e4e',
		accent: 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(59,130,246,0.08))',
		siteUrl: 'https://www.zhihu.com/hot'
	},
	douyin: {
		key: 'douyin',
		label: '\u6296\u97f3',
		accent: 'linear-gradient(135deg, rgba(217,70,239,0.16), rgba(34,211,238,0.08))',
		siteUrl: 'https://www.douyin.com/hot'
	},
	bilibili: {
		key: 'bilibili',
		label: 'Bilibili',
		accent: 'linear-gradient(135deg, rgba(6,182,212,0.16), rgba(14,165,233,0.08))',
		siteUrl: 'https://www.bilibili.com/v/popular/rank/all'
	},
	wallstreetcn: {
		key: 'wallstreetcn',
		label: '\u534e\u5c14\u8857\u89c1\u95fb',
		accent: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(20,184,166,0.08))',
		siteUrl: 'https://wallstreetcn.com/'
	},
	tieba: {
		key: 'tieba',
		label: '\u8d34\u5427',
		accent: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(59,130,246,0.08))',
		siteUrl: 'https://tieba.baidu.com/hottopic/browse/topicList'
	},
	baidu: {
		key: 'baidu',
		label: '\u767e\u5ea6\u70ed\u641c',
		accent: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(139,92,246,0.08))',
		siteUrl: 'https://top.baidu.com/board?tab=realtime'
	},
	cls: {
		key: 'cls',
		label: '\u8d22\u8054\u793e',
		accent: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(249,115,22,0.08))',
		siteUrl: 'https://www.cls.cn/telegraph'
	},
	thepaper: {
		key: 'thepaper',
		label: '\u6f8e\u6e43\u65b0\u95fb',
		accent: 'linear-gradient(135deg, rgba(100,116,139,0.18), rgba(34,211,238,0.08))',
		siteUrl: 'https://www.thepaper.cn/'
	},
	ifeng: {
		key: 'ifeng',
		label: '\u51e4\u51f0\u7f51',
		accent: 'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(249,115,22,0.08))',
		siteUrl: 'https://news.ifeng.com/'
	},
	toutiao: {
		key: 'toutiao',
		label: '\u4eca\u65e5\u5934\u6761',
		accent: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(249,115,22,0.08))',
		siteUrl: 'https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc'
	},
	weibo: {
		key: 'weibo',
		label: '\u5fae\u535a',
		accent: 'linear-gradient(135deg, rgba(249,115,22,0.18), rgba(239,68,68,0.08))',
		siteUrl: 'https://s.weibo.com/top/summary'
	}
}

const RSSHUB_BASES = [process.env.RSSHUB_BASE_URL, 'https://rsshub.app'].filter(Boolean) as string[]
const DAILY_HOT_BASE = process.env.HOT_NEWS_API_BASE || 'https://api-hot.imsyy.top'

function buildHeaders(extra?: HeadersInit): HeadersInit {
	return {
		'User-Agent': NEWS_USER_AGENT,
		Accept: 'application/json,text/plain,text/html,application/xml,text/xml,*/*',
		'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
		...extra
	}
}

async function fetchWithTimeout(input: string, init?: RequestInit) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

	try {
			const response = await fetch(input, {
				...init,
				signal: controller.signal,
				next: { revalidate: TWO_HOURS }
			})

		if (!response.ok) {
			throw new Error(`Request failed: ${response.status}`)
		}

		return response
	} finally {
		clearTimeout(timer)
	}
}

async function fetchJson<T = any>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetchWithTimeout(url, init)
	return response.json()
}

async function fetchText(url: string, init?: RequestInit): Promise<string> {
	const response = await fetchWithTimeout(url, init)
	return response.text()
}

function stripTags(value: string) {
	return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function decodeHtml(value: string) {
	return value
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
}

function extractTag(block: string, tagName: string) {
	const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
	return decodeHtml(pattern.exec(block)?.[1]?.trim() || '')
}

function parseRss(xml: string) {
	const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(match => match[0])
	return items.map(item => ({
		title: stripTags(extractTag(item, 'title')),
		link: stripTags(extractTag(item, 'link')),
		description: stripTags(extractTag(item, 'description')),
		pubDate: stripTags(extractTag(item, 'pubDate')) || stripTags(extractTag(item, 'updated'))
	}))
}

function ensureAbsoluteUrl(url: string | undefined | null, siteUrl: string) {
	if (!url) return siteUrl
	if (/^https?:\/\//i.test(url)) return url

	try {
		return new URL(url, siteUrl).toString()
	} catch {
		return siteUrl
	}
}

function pickString(...values: Array<unknown>) {
	for (const value of values) {
		if (typeof value === 'string' && value.trim()) {
			return value.trim()
		}
	}

	return ''
}

function parseNumberish(value: unknown) {
	if (typeof value === 'number' && Number.isFinite(value)) return value
	if (typeof value !== 'string') return null

	const normalized = value.replace(/[^\d.\u4e07\u4ebfwWkK\u5343]/g, '').trim()
	if (!normalized) return null

	const numeric = parseFloat(normalized)
	if (!Number.isFinite(numeric)) return null

	if (/\u4ebf/i.test(normalized)) return numeric * 100000000
	if (/[\u4e07wW]/.test(normalized)) return numeric * 10000
	if (/[\u5343kK]/.test(normalized)) return numeric * 1000

	return numeric
}

function pickNumber(...values: Array<unknown>) {
	for (const value of values) {
		const parsed = parseNumberish(value)
		if (parsed !== null) return parsed
	}

	return null
}

function buildSourceItems(meta: DailyNewsSourceMeta, items: LooseRecord[], map: (item: LooseRecord, index: number) => Partial<DailyNewsSourceItem>) {
	return items
		.map((item, index) => {
			const mapped = map(item, index)
			const title = pickString(mapped.title)
			if (!title) return null

			return {
				id: `${meta.key}-${index}-${title.slice(0, 24)}`,
				title,
				url: ensureAbsoluteUrl(pickString(mapped.url), meta.siteUrl),
				sourceKey: meta.key,
				sourceLabel: meta.label,
				sourceAccent: meta.accent,
				siteUrl: meta.siteUrl,
				rank: mapped.rank ?? index + 1,
				rawHeat: mapped.rawHeat ?? null,
				summary: pickString(mapped.summary) || null,
				publishedAt: pickString(mapped.publishedAt) || null
			} satisfies Omit<DailyNewsSourceItem, 'heat'>
		})
		.filter(Boolean) as Array<Omit<DailyNewsSourceItem, 'heat'>>
}

function scoreSourceItems(items: Array<Omit<DailyNewsSourceItem, 'heat'>>) {
	if (items.length === 0) return [] as DailyNewsSourceItem[]

	const numericValues = items.map(item => parseNumberish(item.rawHeat)).filter((value): value is number => value !== null)
	const maxNumeric = numericValues.length > 0 ? Math.max(...numericValues) : 0
	const minNumeric = numericValues.length > 0 ? Math.min(...numericValues) : 0

	return items.map((item, index) => {
		const rankScore = ((items.length - index) / items.length) * 68
		const numericHeat = parseNumberish(item.rawHeat)
		let explicitScore = 18

		if (numericHeat !== null && maxNumeric > minNumeric) {
			explicitScore = 20 + ((numericHeat - minNumeric) / (maxNumeric - minNumeric)) * 32
		} else if (numericHeat !== null) {
			explicitScore = 42
		}

		return {
			...item,
			heat: Math.round(rankScore + explicitScore)
		}
	})
}

function normalizeTitle(title: string) {
	return title.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '').trim()
}

function dedupeAggregated(items: DailyNewsSourceItem[]) {
	const map = new Map<string, DailyNewsAggregateItem>()

	for (const item of items) {
		const key = normalizeTitle(item.title)
		if (!key) continue

		const existing = map.get(key)
		if (!existing) {
			map.set(key, {
				id: item.id,
				title: item.title,
				url: item.url,
				heat: item.heat,
				sourceCount: 1,
				sources: [
					{
						key: item.sourceKey,
						label: item.sourceLabel,
						accent: item.sourceAccent,
						rank: item.rank,
						heat: item.heat,
						url: item.url
					}
				],
				summary: item.summary,
				publishedAt: item.publishedAt
			})
			continue
		}

		existing.heat += item.heat
		existing.sourceCount += 1
		existing.sources.push({
			key: item.sourceKey,
			label: item.sourceLabel,
			accent: item.sourceAccent,
			rank: item.rank,
			heat: item.heat,
			url: item.url
		})

		if (item.heat > existing.sources[0].heat) {
			existing.url = item.url
		}

		if (!existing.summary && item.summary) {
			existing.summary = item.summary
		}
	}

	return [...map.values()]
		.map(item => ({
			...item,
			heat: item.heat + (item.sourceCount - 1) * 36,
			sources: item.sources.sort((a, b) => a.rank - b.rank)
		}))
		.sort((a, b) => b.heat - a.heat)
}

async function fetchFromRssHub(meta: DailyNewsSourceMeta, route: string) {
	let lastError: unknown = null

	for (const base of RSSHUB_BASES) {
		try {
			const xml = await fetchText(`${base.replace(/\/$/, '')}/${route.replace(/^\//, '')}`, {
				headers: buildHeaders()
			})
			const parsed = parseRss(xml).slice(0, DEFAULT_LIMIT)
			return scoreSourceItems(
				parsed.map((item, index) => ({
					id: `${meta.key}-rss-${index}`,
					title: item.title,
					url: ensureAbsoluteUrl(item.link, meta.siteUrl),
					sourceKey: meta.key,
					sourceLabel: meta.label,
					sourceAccent: meta.accent,
					siteUrl: meta.siteUrl,
					rank: index + 1,
					rawHeat: parsed.length - index,
					summary: item.description || null,
					publishedAt: item.pubDate || null
				}))
			)
		} catch (error) {
			lastError = error
		}
	}

	throw lastError instanceof Error ? lastError : new Error(`${meta.key} rss fetch failed`)
}

async function fetchFromDailyHot(meta: DailyNewsSourceMeta, path: string) {
	const json = await fetchJson<LooseRecord>(`${DAILY_HOT_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
		headers: buildHeaders()
	})

	const list = (Array.isArray(json?.data) ? json.data : Array.isArray(json?.items) ? json.items : []) as LooseRecord[]
	if (!list.length) {
		throw new Error(`${meta.key} upstream empty`)
	}

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item.title, item.name, item.word, item.desc),
			url: pickString(item.url, item.link, item.mobileUrl, item.mobilUrl, item.href),
			rawHeat: pickString(item.hot, item.hotValue, item.hot_value, item.score, item.desc_extra) || pickNumber(item.hot, item.hotValue, item.hot_value, item.score),
			rank: item.index ?? item.rank ?? index + 1,
			summary: pickString(item.desc, item.description, item.digest)
		}))
	)
}

async function fetchZhihuOfficial(meta: DailyNewsSourceMeta) {
	const json = await fetchJson<LooseRecord>('https://api.zhihu.com/topstory/hot-list?limit=12&desktop=true', {
		headers: buildHeaders({ Referer: 'https://www.zhihu.com/hot' })
	})

	const list = (Array.isArray(json?.data) ? json.data : []) as LooseRecord[]
	if (!list.length) throw new Error('zhihu official empty')

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item?.target?.title_area?.text, item?.target?.title, item?.target?.question?.title),
			url:
				pickString(item?.target?.link?.url) ||
				(item?.target?.id ? `https://www.zhihu.com/question/${item.target.id}` : '') ||
				(item?.target?.question?.id ? `https://www.zhihu.com/question/${item.target.question.id}` : ''),
			rawHeat: pickString(item?.detail_text, item?.target?.metrics_area?.text),
			rank: item?.index ?? index + 1,
			summary: pickString(item?.target?.excerpt_area?.text, item?.target?.excerpt)
		}))
	)
}

async function fetchDouyinOfficial(meta: DailyNewsSourceMeta) {
	const json = await fetchJson<LooseRecord>(
		'https://www.douyin.com/aweme/v1/web/hot/search/list/?device_platform=webapp&aid=6383&channel=channel_pc_web',
		{
			headers: buildHeaders({ Referer: 'https://www.douyin.com/hot' })
		}
	)

	const list = (Array.isArray(json?.data?.word_list) ? json.data.word_list : Array.isArray(json?.word_list) ? json.word_list : []) as LooseRecord[]
	if (!list.length) throw new Error('douyin official empty')

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item.word, item.sentence),
			url: item.sentence_id ? `https://www.douyin.com/hot/${item.sentence_id}` : `https://www.douyin.com/search/${encodeURIComponent(pickString(item.word))}`,
			rawHeat: pickNumber(item.hot_value, item.hot, item.view_count) ?? pickString(item.hot_value, item.hot),
			rank: item.position ?? index + 1,
			summary: pickString(item.word_tag)
		}))
	)
}

async function fetchBilibiliOfficial(meta: DailyNewsSourceMeta) {
	const json = await fetchJson<LooseRecord>('https://api.bilibili.com/x/web-interface/ranking/v2?rid=0&type=all', {
		headers: buildHeaders({ Referer: 'https://www.bilibili.com/v/popular/rank/all' })
	})

	const list = (Array.isArray(json?.data?.list) ? json.data.list : Array.isArray(json?.data) ? json.data : []) as LooseRecord[]
	if (!list.length) throw new Error('bilibili official empty')

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item.title),
			url: item.bvid ? `https://www.bilibili.com/video/${item.bvid}` : pickString(item.short_link_v2, item.uri),
			rawHeat: pickNumber(item?.stat?.view, item.play, item.view) ?? pickString(item?.stat?.view, item.play, item.view),
			rank: index + 1,
			summary: pickString(item.desc)
		}))
	)
}

async function fetchTiebaOfficial(meta: DailyNewsSourceMeta) {
	const json = await fetchJson<LooseRecord>('https://tieba.baidu.com/hottopic/browse/topicList', {
		headers: buildHeaders({ Referer: 'https://tieba.baidu.com/' })
	})

	const list = (Array.isArray(json?.data?.bang_topic?.topic_list) ? json.data.bang_topic.topic_list : []) as LooseRecord[]
	if (!list.length) throw new Error('tieba official empty')

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item.topic_name, item.name),
			url: pickString(item.topic_url, item.url),
			rawHeat: pickNumber(item.discuss_num, item.search_num) ?? pickString(item.discuss_num, item.search_num),
			rank: index + 1,
			summary: pickString(item.abstract, item.desc)
		}))
	)
}

async function fetchBaiduOfficial(meta: DailyNewsSourceMeta) {
	const json = await fetchJson<LooseRecord>('https://top.baidu.com/api/board?platform=pc&tab=realtime', {
		headers: buildHeaders({ Referer: 'https://top.baidu.com/board?tab=realtime' })
	})

	const list = (Array.isArray(json?.data?.cards?.[0]?.content) ? json.data.cards[0].content : []) as LooseRecord[]
	if (!list.length) throw new Error('baidu official empty')

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item.word, item.query),
			url: pickString(item.url) || (item.query ? `https://www.baidu.com/s?wd=${encodeURIComponent(item.query)}` : ''),
			rawHeat: pickNumber(item.hotScore, item.hot, item.score) ?? pickString(item.hotScore, item.hot, item.score),
			rank: item.index ?? index + 1,
			summary: pickString(item.desc, item.brief)
		}))
	)
}

async function fetchToutiaoOfficial(meta: DailyNewsSourceMeta) {
	const json = await fetchJson<LooseRecord>('https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc', {
		headers: buildHeaders({ Referer: 'https://www.toutiao.com/' })
	})

	const list = (Array.isArray(json?.data) ? json.data : Array.isArray(json?.word_list) ? json.word_list : []) as LooseRecord[]
	if (!list.length) throw new Error('toutiao official empty')

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item.Title, item.title, item.word),
			url:
				pickString(item.Url, item.url) ||
				(item.ClusterId ? `https://www.toutiao.com/trending/${item.ClusterId}/` : '') ||
				(item.id ? `https://www.toutiao.com/trending/${item.id}/` : ''),
			rawHeat: pickNumber(item.HotValue, item.hot_value, item.score) ?? pickString(item.HotValue, item.hot_value, item.score),
			rank: index + 1,
			summary: pickString(item.Label, item.label_desc)
		}))
	)
}

async function fetchWeiboOfficial(meta: DailyNewsSourceMeta) {
	const json = await fetchJson<LooseRecord>('https://weibo.com/ajax/side/hotSearch', {
		headers: buildHeaders({ Referer: 'https://s.weibo.com/top/summary' })
	})

	const list = (Array.isArray(json?.data?.realtime) ? json.data.realtime : []) as LooseRecord[]
	if (!list.length) throw new Error('weibo official empty')

	return scoreSourceItems(
		buildSourceItems(meta, list.slice(0, DEFAULT_LIMIT), (item, index) => ({
			title: pickString(item.word, item.note),
			url: item.word ? `https://s.weibo.com/weibo?q=%23${encodeURIComponent(item.word)}%23` : pickString(item.scheme),
			rawHeat: pickNumber(item.num, item.raw_hot) ?? pickString(item.num, item.raw_hot),
			rank: item.rank ?? index + 1,
			summary: pickString(item.label_name, item.icon_desc)
		}))
	)
}

async function runAttempts(attempts: FetchAttempt[]) {
	let lastError: unknown = null

	for (const attempt of attempts) {
		try {
			const result = await attempt()
			if (result.length > 0) {
				return result
			}
		} catch (error) {
			lastError = error
		}
	}

	throw lastError instanceof Error ? lastError : new Error('No news source available')
}

function createSourceConfigs(): DailyNewsSourceConfig[] {
	return [
		{
			...SOURCE_META.zhihu,
			attempts: [() => fetchZhihuOfficial(SOURCE_META.zhihu), () => fetchFromDailyHot(SOURCE_META.zhihu, '/zhihu'), () => fetchFromRssHub(SOURCE_META.zhihu, '/zhihu/hotlist')]
		},
		{
			...SOURCE_META.douyin,
			attempts: [() => fetchDouyinOfficial(SOURCE_META.douyin), () => fetchFromDailyHot(SOURCE_META.douyin, '/douyin'), () => fetchFromRssHub(SOURCE_META.douyin, '/douyin/hot')]
		},
		{
			...SOURCE_META.bilibili,
			attempts: [() => fetchBilibiliOfficial(SOURCE_META.bilibili), () => fetchFromDailyHot(SOURCE_META.bilibili, '/bilibili'), () => fetchFromRssHub(SOURCE_META.bilibili, '/bilibili/popular/all')]
		},
		{
			...SOURCE_META.wallstreetcn,
			attempts: [() => fetchFromDailyHot(SOURCE_META.wallstreetcn, '/wallstreetcn'), () => fetchFromRssHub(SOURCE_META.wallstreetcn, '/wallstreetcn/hot')]
		},
		{
			...SOURCE_META.tieba,
			attempts: [() => fetchTiebaOfficial(SOURCE_META.tieba), () => fetchFromDailyHot(SOURCE_META.tieba, '/tieba'), () => fetchFromRssHub(SOURCE_META.tieba, '/tieba/hot-search')]
		},
		{
			...SOURCE_META.baidu,
			attempts: [() => fetchBaiduOfficial(SOURCE_META.baidu), () => fetchFromDailyHot(SOURCE_META.baidu, '/baidu'), () => fetchFromRssHub(SOURCE_META.baidu, '/baidu/top')]
		},
		{
			...SOURCE_META.cls,
			attempts: [() => fetchFromDailyHot(SOURCE_META.cls, '/cls'), () => fetchFromRssHub(SOURCE_META.cls, '/cls/hot')]
		},
		{
			...SOURCE_META.thepaper,
			attempts: [() => fetchFromDailyHot(SOURCE_META.thepaper, '/thepaper'), () => fetchFromRssHub(SOURCE_META.thepaper, '/thepaper/featured')]
		},
		{
			...SOURCE_META.ifeng,
			attempts: [() => fetchFromDailyHot(SOURCE_META.ifeng, '/ifeng'), () => fetchFromRssHub(SOURCE_META.ifeng, '/ifeng/index')]
		},
		{
			...SOURCE_META.toutiao,
			attempts: [() => fetchToutiaoOfficial(SOURCE_META.toutiao), () => fetchFromDailyHot(SOURCE_META.toutiao, '/toutiao'), () => fetchFromRssHub(SOURCE_META.toutiao, '/toutiao/hot')]
		},
		{
			...SOURCE_META.weibo,
			attempts: [() => fetchWeiboOfficial(SOURCE_META.weibo), () => fetchFromDailyHot(SOURCE_META.weibo, '/weibo'), () => fetchFromRssHub(SOURCE_META.weibo, '/weibo/search/hot')]
		}
	]
}

export async function getDailyNews(): Promise<DailyNewsResponse> {
	const configs = createSourceConfigs()
	const settled = await Promise.allSettled(
		configs.map(async source => ({
			key: source.key,
			items: await runAttempts(source.attempts)
		}))
	)

	const sourceBuckets = {} as Record<DailyNewsSourceKey, DailyNewsSourceItem[]>
	const failedSources: DailyNewsSourceKey[] = []
	const allItems: DailyNewsSourceItem[] = []

	for (let index = 0; index < configs.length; index += 1) {
		const config = configs[index]
		const result = settled[index]

		if (result.status === 'fulfilled') {
			sourceBuckets[config.key] = result.value.items
			allItems.push(...result.value.items)
		} else {
			sourceBuckets[config.key] = []
			failedSources.push(config.key)
		}
	}

	return {
		updatedAt: new Date().toISOString(),
		refreshIntervalHours: 2,
		sources: configs.map(({ attempts: _attempts, ...meta }) => meta),
		aggregated: dedupeAggregated(allItems).slice(0, 40),
		sourceBuckets,
		failedSources
	}
}

export const DAILY_NEWS_REVALIDATE_SECONDS = TWO_HOURS
