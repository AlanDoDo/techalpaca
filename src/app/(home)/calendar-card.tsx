'use client'

import Link from 'next/link'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { ArrowRight, Flame, Newspaper, RefreshCw } from 'lucide-react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { useDailyNews } from '@/hooks/use-daily-news'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'

dayjs.locale('zh-cn')

export default function CalendarCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { data, error, isLoading } = useDailyNews()
	const styles = cardStyles.calendarCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING
	const items = data?.aggregated?.slice(0, 12) ?? []
	const visibleSources = data?.sources?.length ?? 0
	const bodyHeight = Math.max(styles.height - 124, 112)

	return (
		<HomeDraggableLayer cardKey='calendarCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex flex-col overflow-hidden'>
				{siteContent.enableChristmas && (
					<img
						src='/images/christmas/snow-7.webp'
						alt='Christmas decoration'
						className='pointer-events-none absolute'
						style={{ width: 150, right: -12, top: -12, opacity: 0.7 }}
					/>
				)}

				<div className='mb-3 flex items-start justify-between gap-3'>
					<div>
						<div className='inline-flex items-center gap-2 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-medium text-gray-500'>
							<Newspaper className='h-3.5 w-3.5 text-brand' />
							每日新闻
						</div>
						<div className='mt-2 text-xs text-gray-500'>
							{data?.updatedAt ? `${dayjs(data.updatedAt).format('MM/DD HH:mm')} 更新` : '正在汇总热点'}
						</div>
					</div>
					<Link href='/news' className='inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition hover:border-brand/30 hover:text-brand'>
						查看全部
						<ArrowRight className='h-3.5 w-3.5' />
					</Link>
				</div>

				<div className='mb-3 grid grid-cols-2 gap-2'>
					<div className='rounded-[22px] border border-white/70 bg-white/70 px-3 py-2'>
						<div className='text-[11px] text-gray-500'>覆盖来源</div>
						<div className='mt-1 text-sm font-semibold text-gray-900'>{visibleSources} 个站点</div>
					</div>
					<div className='rounded-[22px] border border-white/70 bg-white/70 px-3 py-2'>
						<div className='text-[11px] text-gray-500'>刷新节奏</div>
						<div className='mt-1 inline-flex items-center gap-1 text-sm font-semibold text-gray-900'>
							<RefreshCw className='h-3.5 w-3.5 text-brand' />
							6 小时
						</div>
					</div>
				</div>

				{isLoading ? (
					<div className='grid gap-2' style={{ height: bodyHeight }}>
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className='animate-pulse rounded-[24px] bg-black/5' />
						))}
					</div>
				) : error ? (
					<div className='flex flex-1 items-center justify-center rounded-[28px] border border-red-200 bg-red-50 px-4 text-center text-xs leading-6 text-red-600' style={{ height: bodyHeight }}>
						热点聚合暂时不可用，稍后会自动重试。
					</div>
				) : (
					<div className='space-y-2 overflow-y-auto pr-1' style={{ height: bodyHeight }}>
						{items.map((item, index) => (
							<a key={item.id} href={item.url} target='_blank' rel='noreferrer' className='group block rounded-[24px] border border-white/70 bg-white/82 px-3 py-3 transition hover:-translate-y-0.5 hover:border-brand/25 hover:bg-white'>
								<div className='flex items-start gap-3'>
									<div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(249,115,22,0.14))] text-xs font-semibold text-gray-800'>
										{index + 1}
									</div>
									<div className='min-w-0 flex-1'>
										<div className='line-clamp-2 text-sm font-medium leading-5 text-gray-900'>{item.title}</div>
										<div className='mt-2 flex flex-wrap items-center gap-1.5'>
											<div className='inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-600'>
												<Flame className='h-3 w-3' />
												{item.heat}
											</div>
											{item.sources.slice(0, 3).map(source => (
												<span key={`${item.id}-${source.key}`} className='rounded-full border px-2 py-0.5 text-[10px] text-gray-600' style={{ backgroundImage: source.accent }}>
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
			</Card>
		</HomeDraggableLayer>
	)
}
