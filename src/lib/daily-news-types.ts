export type DailyNewsSourceKey =
	| 'zhihu'
	| 'douyin'
	| 'bilibili'
	| 'wallstreetcn'
	| 'tieba'
	| 'baidu'
	| 'cls'
	| 'thepaper'
	| 'ifeng'
	| 'toutiao'
	| 'weibo'

export interface DailyNewsSourceMeta {
	key: DailyNewsSourceKey
	label: string
	accent: string
	siteUrl: string
}

export interface DailyNewsSourceItem {
	id: string
	title: string
	url: string
	sourceKey: DailyNewsSourceKey
	sourceLabel: string
	sourceAccent: string
	siteUrl: string
	rank: number
	heat: number
	rawHeat?: string | number | null
	summary?: string | null
	publishedAt?: string | null
}

export interface DailyNewsAggregateItem {
	id: string
	title: string
	url: string
	heat: number
	sourceCount: number
	sources: Array<{
		key: DailyNewsSourceKey
		label: string
		accent: string
		rank: number
		heat: number
		url: string
	}>
	summary?: string | null
	publishedAt?: string | null
}

export interface DailyNewsResponse {
	updatedAt: string
	refreshIntervalHours: number
	sources: DailyNewsSourceMeta[]
	aggregated: DailyNewsAggregateItem[]
	sourceBuckets: Record<DailyNewsSourceKey, DailyNewsSourceItem[]>
	failedSources: DailyNewsSourceKey[]
}
