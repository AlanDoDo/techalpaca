'use client'

import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, Flame, Newspaper, RefreshCw } from 'lucide-react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { useDailyNews } from '@/hooks/use-daily-news'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'

dayjs.locale('zh-cn')

const TEXT = {
	title: '\u6bcf\u65e5\u65b0\u95fb',
	updatedSuffix: ' \u66f4\u65b0',
	loading: '\u6b63\u5728\u6c47\u603b\u5168\u7f51\u70ed\u70b9',
	viewAll: '\u67e5\u770b\u5168\u90e8',
	availableSources: '\u53ef\u7528\u6765\u6e90',
	refreshRhythm: '\u5237\u65b0\u8282\u594f',
	currentHotlist: '\u5f53\u524d\u70ed\u699c',
	itemsSuffix: ' \u6761',
	twoHours: '2 \u5c0f\u65f6',
	stationSuffix: ' / ',
	stationUnit: '',
	failedNoticeSuffix: ' \u4e2a\u6765\u6e90\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u7a0d\u540e\u4f1a\u81ea\u52a8\u8865\u9f50',
	aggregationError: '\u70ed\u70b9\u805a\u5408\u6682\u65f6\u4e0d\u53ef\u7528\uff0c\u7a0d\u540e\u4f1a\u81ea\u52a8\u91cd\u8bd5\u3002'
} as const

export default function DailyNewsCard() {
	const router = useRouter()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const { data, error, isLoading } = useDailyNews()
	const styles = cardStyles.calendarCard
	const hiCardStyles = cardStyles.hiCard
	const englishCardStyles = cardStyles.clockCard
	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - englishCardStyles.offset + CARD_SPACING
	const items = data?.aggregated?.slice(0, 8) ?? []
	const visibleSources = data?.sources?.length ?? 0
	const failedSources = data?.failedSources?.length ?? 0
	const bodyHeight = Math.max(styles.height - 144, 128)
	const activeSources = Math.max(0, visibleSources - failedSources)

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
							{TEXT.title}
						</div>
						<div className='mt-2 text-xs text-gray-500'>
							{data?.updatedAt ? `${dayjs(data.updatedAt).format('MM/DD HH:mm')}${TEXT.updatedSuffix}` : TEXT.loading}
						</div>
					</div>

					<button
						type='button'
						onClick={() => router.push('/news')}
						className='inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/85 px-2.5 py-1 text-[11px] font-medium text-gray-600 transition hover:border-brand/30 hover:text-brand'>
						{TEXT.viewAll}
						<ArrowRight className='h-3.5 w-3.5' />
					</button>
				</div>

				<div className='mb-3 grid grid-cols-3 gap-2'>
					<div className='rounded-[22px] border border-white/70 bg-white/70 px-3 py-2'>
						<div className='text-[11px] text-gray-500'>{TEXT.availableSources}</div>
						<div className='mt-1 text-sm font-semibold text-gray-900'>{activeSources} / {visibleSources}</div>
					</div>
					<div className='rounded-[22px] border border-white/70 bg-white/70 px-3 py-2'>
						<div className='text-[11px] text-gray-500'>{TEXT.refreshRhythm}</div>
						<div className='mt-1 inline-flex items-center gap-1 text-sm font-semibold text-gray-900'>
							<RefreshCw className='h-3.5 w-3.5 text-brand' />
							{TEXT.twoHours}
						</div>
					</div>
					<div className='rounded-[22px] border border-white/70 bg-white/70 px-3 py-2'>
						<div className='text-[11px] text-gray-500'>{TEXT.currentHotlist}</div>
						<div className='mt-1 text-sm font-semibold text-gray-900'>{data?.aggregated?.length ?? 0}{TEXT.itemsSuffix}</div>
					</div>
				</div>

				{failedSources > 0 && !isLoading && !error && (
					<div className='mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700'>
						<AlertCircle className='h-3.5 w-3.5' />
						{failedSources}
						{TEXT.failedNoticeSuffix}
					</div>
				)}

				{isLoading ? (
					<div className='grid gap-2' style={{ height: bodyHeight }}>
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className='animate-pulse rounded-[24px] bg-black/5' />
						))}
					</div>
				) : error ? (
					<div className='flex flex-1 items-center justify-center rounded-[28px] border border-red-200 bg-red-50 px-4 text-center text-xs leading-6 text-red-600' style={{ height: bodyHeight }}>
						{TEXT.aggregationError}
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
