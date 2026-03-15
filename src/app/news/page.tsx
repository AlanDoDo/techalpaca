'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ArrowLeft, ExternalLink, Flame, RefreshCw, Sparkles } from 'lucide-react'
import { useDailyNews } from '@/hooks/use-daily-news'

dayjs.locale('zh-cn')

export default function NewsPage() {
	const { data, error, isLoading } = useDailyNews()

	const aggregated = data?.aggregated ?? []
	const sourceBuckets = data?.sourceBuckets
	const sources = data?.sources ?? []

	return (
		<div className='mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 pt-28 pb-16 sm:px-6 lg:px-8'>
			<section className='relative overflow-hidden rounded-[36px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8'>
				<div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_28%)]' />
				<div className='relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
					<div className='space-y-3'>
						<Link href='/' className='inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand/30 hover:text-brand'>
							<ArrowLeft className='h-3.5 w-3.5' />
							返回主页
						</Link>
						<div className='inline-flex w-fit items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-gray-600'>
							<Sparkles className='h-3.5 w-3.5 text-brand' />
							全网热点聚合
						</div>
						<div>
							<h1 className='text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl'>每日新闻</h1>
							<p className='mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base'>
								按热度聚合知乎、抖音、Bilibili、华尔街见闻、贴吧、百度热搜、财联社、澎湃新闻、凤凰网、今日头条和微博的热点内容。
							</p>
						</div>
					</div>

					<div className='grid gap-3 sm:grid-cols-3'>
						<div className='rounded-[28px] border border-white/70 bg-white/80 px-4 py-3'>
							<div className='text-xs text-gray-500'>更新时间</div>
							<div className='mt-1 text-sm font-medium text-gray-900'>{data?.updatedAt ? dayjs(data.updatedAt).format('YYYY/MM/DD HH:mm') : '等待载入'}</div>
						</div>
						<div className='rounded-[28px] border border-white/70 bg-white/80 px-4 py-3'>
							<div className='text-xs text-gray-500'>刷新周期</div>
							<div className='mt-1 inline-flex items-center gap-2 text-sm font-medium text-gray-900'>
								<RefreshCw className='h-3.5 w-3.5 text-brand' />
								每 {data?.refreshIntervalHours ?? 6} 小时刷新一次
							</div>
						</div>
						<div className='rounded-[28px] border border-white/70 bg-white/80 px-4 py-3'>
							<div className='text-xs text-gray-500'>覆盖来源</div>
							<div className='mt-1 text-sm font-medium text-gray-900'>{sources.length} 个热点源</div>
						</div>
					</div>
				</div>
			</section>

			<div className='grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]'>
				<section className='rounded-[36px] border border-white/60 bg-white/70 p-5 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.28)] backdrop-blur sm:p-6'>
					<div className='mb-4 flex items-center justify-between'>
						<div>
							<h2 className='text-lg font-semibold text-gray-900'>综合热榜</h2>
							<p className='mt-1 text-xs text-gray-500'>多平台热点去重后排序，优先显示多源共振的话题。</p>
						</div>
						<div className='rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-gray-600'>{aggregated.length} 条</div>
					</div>

					{isLoading ? (
						<div className='grid gap-3'>
							{Array.from({ length: 8 }).map((_, index) => (
								<div key={index} className='h-24 animate-pulse rounded-[28px] bg-black/5' />
							))}
						</div>
					) : error ? (
						<div className='rounded-[28px] border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600'>热点新闻暂时加载失败，请稍后再试。</div>
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
													热度 {item.heat}
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

						return (
							<div key={source.key} className='rounded-[32px] border border-white/60 bg-white/70 p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.28)] backdrop-blur'>
								<div className='mb-4 flex items-center justify-between gap-3'>
									<div>
										<h3 className='text-sm font-semibold text-gray-900'>{source.label}</h3>
										<p className='mt-1 text-xs text-gray-500'>卡片内按热度展示前 5 条，可继续扩展更多来源。</p>
									</div>
									<a href={source.siteUrl} target='_blank' rel='noreferrer' className='rounded-full border px-3 py-1 text-[11px] font-medium text-gray-700 transition hover:border-brand/30 hover:text-brand' style={{ backgroundImage: source.accent }}>
										直达来源
									</a>
								</div>

								<div className='space-y-2'>
									{items.slice(0, 5).map((item, index) => (
										<a key={item.id} href={item.url} target='_blank' rel='noreferrer' className='flex items-start gap-3 rounded-[22px] bg-white/80 px-3 py-2.5 transition hover:bg-white'>
											<div className='text-xs font-semibold text-gray-400'>{String(index + 1).padStart(2, '0')}</div>
											<div className='min-w-0 flex-1'>
												<div className='line-clamp-2 text-sm font-medium text-gray-800'>{item.title}</div>
												<div className='mt-1 text-[11px] text-gray-500'>热度 {item.heat}</div>
											</div>
										</a>
									))}

									{items.length === 0 && <div className='rounded-[22px] bg-black/5 px-3 py-4 text-xs text-gray-500'>当前来源暂时没有可用数据，稍后会自动重试。</div>}
								</div>
							</div>
						)
					})}
				</section>
			</div>
		</div>
	)
}
