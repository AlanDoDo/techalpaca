'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { AlertCircle, ArrowLeft, ExternalLink, Flame, RefreshCw, Sparkles } from 'lucide-react'
import { useDailyNews } from '@/hooks/use-daily-news'

dayjs.locale('zh-cn')

const TEXT = {
	backHome: '\u8fd4\u56de\u4e3b\u9875',
	aggregation: '\u5168\u7f51\u70ed\u70b9\u805a\u5408',
	title: '\u6bcf\u65e5\u65b0\u95fb',
	description:
		'\u6309\u70ed\u5ea6\u805a\u5408\u77e5\u4e4e\u3001\u6296\u97f3\u3001Bilibili\u3001\u534e\u5c14\u8857\u89c1\u95fb\u3001\u8d34\u5427\u3001\u767e\u5ea6\u70ed\u641c\u3001\u8d22\u8054\u793e\u3001\u6f8e\u6e43\u65b0\u95fb\u3001\u51e4\u51f0\u7f51\u3001\u4eca\u65e5\u5934\u6761\u548c\u5fae\u535a\u7684\u70ed\u70b9\u5185\u5bb9\uff0c\u9ed8\u8ba4\u6bcf 2 \u5c0f\u65f6\u5237\u65b0\u4e00\u6b21\u3002',
	updatedAt: '\u66f4\u65b0\u65f6\u95f4',
	waiting: '\u7b49\u5f85\u8f7d\u5165',
	refreshCycle: '\u5237\u65b0\u5468\u671f',
	refreshEveryTwoHours: '\u6bcf ',
	hoursSuffix: ' \u5c0f\u65f6\u5237\u65b0\u4e00\u6b21',
	availableSources: '\u53ef\u7528\u6765\u6e90',
	hotSourcesSuffix: ' \u4e2a\u70ed\u70b9\u6e90',
	aggregatedList: '\u7efc\u5408\u70ed\u699c',
	itemsSuffix: ' \u6761',
	failedSourcesNoticePrefix: '',
	failedSourcesNoticeSuffix: ' \u4e2a\u6765\u6e90\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u7cfb\u7edf\u4f1a\u5728\u4e0b\u4e00\u8f6e\u5237\u65b0\u65f6\u81ea\u52a8\u91cd\u8bd5',
	aggregatedHeading: '\u7efc\u5408\u70ed\u699c',
	aggregatedDescription: '\u591a\u5e73\u53f0\u70ed\u70b9\u53bb\u91cd\u540e\u6392\u5e8f\uff0c\u4f18\u5148\u663e\u793a\u591a\u6e90\u5171\u632f\u7684\u8bdd\u9898\u3002',
	loadFailed: '\u70ed\u70b9\u65b0\u95fb\u6682\u65f6\u52a0\u8f7d\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002',
	heatPrefix: '\u70ed\u5ea6 ',
	resonanceSuffix: ' \u4e2a\u6765\u6e90\u5171\u632f',
	sourceCardDescription: '\u5361\u7247\u5185\u6309\u70ed\u5ea6\u5c55\u793a\u524d 5 \u6761\uff0c\u7cfb\u7edf\u4f1a\u5b9a\u65f6\u5237\u65b0\u5e76\u81ea\u52a8\u56de\u9000\u53ef\u7528\u6765\u6e90\u3002',
	directSource: '\u76f4\u8fbe\u6765\u6e90',
	sourceFailed: '\u5f53\u524d\u6765\u6e90\u6293\u53d6\u5931\u8d25\uff0c\u7b49\u5f85\u4e0b\u4e00\u8f6e\u81ea\u52a8\u6062\u590d',
	sourceEmpty: '\u5f53\u524d\u6765\u6e90\u6682\u65f6\u6ca1\u6709\u53ef\u7528\u6570\u636e\uff0c\u7a0d\u540e\u4f1a\u81ea\u52a8\u91cd\u8bd5\u3002'
} as const

export default function NewsPage() {
	const { data, error, isLoading } = useDailyNews()

	const aggregated = data?.aggregated ?? []
	const sourceBuckets = data?.sourceBuckets
	const sources = data?.sources ?? []
	const failedSources = data?.failedSources ?? []
	const activeSources = Math.max(0, sources.length - failedSources.length)

	return (
		<div className='mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 pt-28 pb-16 sm:px-6 lg:px-8'>
			<section className='relative overflow-hidden rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8'>
				<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_28%)]' />

				<div className='relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
					<div className='space-y-3'>
						<Link href='/' className='inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand/30 hover:text-brand'>
							<ArrowLeft className='h-3.5 w-3.5' />
							{TEXT.backHome}
						</Link>

						<div className='inline-flex w-fit items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-gray-600'>
							<Sparkles className='h-3.5 w-3.5 text-brand' />
							{TEXT.aggregation}
						</div>

						<div>
							<h1 className='text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl'>{TEXT.title}</h1>
							<p className='mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base'>{TEXT.description}</p>
						</div>
					</div>

					<div className='grid gap-3 sm:grid-cols-4'>
						<StatCard label={TEXT.updatedAt} value={data?.updatedAt ? dayjs(data.updatedAt).format('YYYY/MM/DD HH:mm') : TEXT.waiting} />

						<div className='rounded-[28px] border border-white/70 bg-white/80 px-4 py-3'>
							<div className='text-xs text-gray-500'>{TEXT.refreshCycle}</div>
							<div className='mt-1 inline-flex items-center gap-2 text-sm font-medium text-gray-900'>
								<RefreshCw className='h-3.5 w-3.5 text-brand' />
								{TEXT.refreshEveryTwoHours}
								{data?.refreshIntervalHours ?? 2}
								{TEXT.hoursSuffix}
							</div>
						</div>

						<StatCard label={TEXT.availableSources} value={`${activeSources} / ${sources.length}${TEXT.hotSourcesSuffix}`} />
						<StatCard label={TEXT.aggregatedList} value={`${aggregated.length}${TEXT.itemsSuffix}`} />
					</div>
				</div>

				{failedSources.length > 0 && !error && (
					<div className='relative mt-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700'>
						<AlertCircle className='h-3.5 w-3.5' />
						{failedSources.length}
						{TEXT.failedSourcesNoticeSuffix}
					</div>
				)}
			</section>

			<div className='grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]'>
				<section className='rounded-[36px] border border-white/60 bg-white/70 p-5 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.28)] backdrop-blur sm:p-6'>
					<div className='mb-4 flex items-center justify-between'>
						<div>
							<h2 className='text-lg font-semibold text-gray-900'>{TEXT.aggregatedHeading}</h2>
							<p className='mt-1 text-xs text-gray-500'>{TEXT.aggregatedDescription}</p>
						</div>
						<div className='rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-gray-600'>{aggregated.length}{TEXT.itemsSuffix}</div>
					</div>

					{isLoading ? (
						<div className='grid gap-3'>
							{Array.from({ length: 8 }).map((_, index) => (
								<div key={index} className='h-24 animate-pulse rounded-[28px] bg-black/5' />
							))}
						</div>
					) : error ? (
						<div className='rounded-[28px] border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600'>{TEXT.loadFailed}</div>
					) : (
						<div className='grid gap-3'>
							{aggregated.map((item, index) => (
								<a
									key={item.id}
									href={item.url}
									target='_blank'
									rel='noreferrer'
									className='group rounded-[30px] border border-black/5 bg-white/85 p-4 transition hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_20px_40px_-32px_rgba(14,165,233,0.6)]'>
									<div className='flex items-start gap-4'>
										<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(249,115,22,0.18))] text-sm font-semibold text-gray-800'>
											{String(index + 1).padStart(2, '0')}
										</div>

										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-3'>
												<h3 className='line-clamp-2 text-sm font-semibold leading-6 text-gray-900 sm:text-[15px]'>{item.title}</h3>
												<ExternalLink className='mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition group-hover:text-brand' />
											</div>

											{item.summary && <p className='mt-2 line-clamp-2 text-xs leading-5 text-gray-500'>{item.summary}</p>}

											<div className='mt-3 flex flex-wrap items-center gap-2'>
												<div className='inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-600'>
													<Flame className='h-3.5 w-3.5' />
													{TEXT.heatPrefix}
													{item.heat}
												</div>

												<div className='rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-medium text-gray-600'>
													{item.sourceCount}
													{TEXT.resonanceSuffix}
												</div>

												{item.sources.map(source => (
													<span key={`${item.id}-${source.key}`} className='rounded-full border px-2.5 py-1 text-[11px] font-medium text-gray-600' style={{ backgroundImage: source.accent }}>
														{source.label}
													</span>
												))}
											</div>
										</div>
									</div>
								</a>
							))}
						</div>
					)}
				</section>

				<section className='space-y-4'>
					{sources.map(source => {
						const items = sourceBuckets?.[source.key] ?? []
						const isFailed = failedSources.includes(source.key)

						return (
							<div key={source.key} className='rounded-[32px] border border-white/60 bg-white/70 p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)] backdrop-blur'>
								<div className='mb-4 flex items-center justify-between gap-3'>
									<div>
										<h3 className='text-sm font-semibold text-gray-900'>{source.label}</h3>
										<p className='mt-1 text-xs text-gray-500'>{TEXT.sourceCardDescription}</p>
									</div>

									<a href={source.siteUrl} target='_blank' rel='noreferrer' className='rounded-full border px-3 py-1 text-[11px] font-medium text-gray-700 transition hover:border-brand/30 hover:text-brand' style={{ backgroundImage: source.accent }}>
										{TEXT.directSource}
									</a>
								</div>

								{isFailed && (
									<div className='mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700'>
										<AlertCircle className='h-3.5 w-3.5' />
										{TEXT.sourceFailed}
									</div>
								)}

								<div className='space-y-2'>
									{items.slice(0, 5).map((item, index) => (
										<a key={item.id} href={item.url} target='_blank' rel='noreferrer' className='flex items-start gap-3 rounded-[22px] bg-white/80 px-3 py-2.5 transition hover:bg-white'>
											<div className='text-xs font-semibold text-gray-400'>{String(index + 1).padStart(2, '0')}</div>
											<div className='min-w-0 flex-1'>
												<div className='line-clamp-2 text-sm font-medium text-gray-800'>{item.title}</div>
												<div className='mt-1 text-[11px] text-gray-500'>{TEXT.heatPrefix}{item.heat}</div>
											</div>
										</a>
									))}

									{items.length === 0 && <div className='rounded-[22px] bg-black/5 px-3 py-4 text-xs text-gray-500'>{TEXT.sourceEmpty}</div>}
								</div>
							</div>
						)
					})}
				</section>
			</div>
		</div>
	)
}

function StatCard({ label, value }: { label: string; value: string }) {
	return (
		<div className='rounded-[28px] border border-white/70 bg-white/80 px-4 py-3'>
			<div className='text-xs text-gray-500'>{label}</div>
			<div className='mt-1 text-sm font-medium text-gray-900'>{value}</div>
		</div>
	)
}
