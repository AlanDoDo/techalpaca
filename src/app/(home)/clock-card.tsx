'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BookMarked, Quote, Sparkles } from 'lucide-react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { CARD_SPACING } from '@/consts'
import { useConfigStore } from './stores/config-store'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useDailyEnglish } from '@/hooks/use-daily-english'
import { getDueDailyEnglishEntries, readDailyEnglishReviewState } from '@/features/daily-english/review'

export default function DailyEnglishCard() {
	const router = useRouter()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const editing = useLayoutEditStore(state => state.editing)
	const { data } = useDailyEnglish()
	const [dueCount, setDueCount] = useState(0)
	const styles = cardStyles.clockCard
	const hiCardStyles = cardStyles.hiCard
	const currentEntry = data?.current
	const reviewEntries = data?.confirmed?.length ? data.confirmed : data?.history ?? []

	useEffect(() => {
		const syncReviewCount = () => {
			const reviewState = readDailyEnglishReviewState()
			setDueCount(getDueDailyEnglishEntries(reviewEntries, reviewState, new Date(), 99).length)
		}

		syncReviewCount()
		window.addEventListener('storage', syncReviewCount)
		return () => {
			window.removeEventListener('storage', syncReviewCount)
		}
	}, [reviewEntries])

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - styles.offset - styles.height

	const sourceLabel = useMemo(() => {
		if (!data) return '同步中'
		return data.source.fallback ? '本地兜底' : 'Tatoeba'
	}, [data])

	return (
		<HomeDraggableLayer cardKey='clockCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='overflow-hidden p-2'>
				<button
					type='button'
					onClick={() => {
						if (!editing) {
							router.push('/clock')
						}
					}}
					className='relative grid h-full w-full grid-rows-[auto_1fr_auto] gap-4 overflow-hidden rounded-[34px] border border-white/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.99),rgba(255,251,247,0.97)_54%,rgba(250,243,237,0.95))] px-5 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]'>
					<div className='pointer-events-none absolute inset-0'>
						<div className='absolute top-[-42px] right-[-18px] h-36 w-36 rounded-full bg-[rgba(243,184,136,0.16)] blur-3xl' />
						<div className='absolute top-8 right-14 h-16 w-16 rounded-full bg-[rgba(255,255,255,0.78)] blur-2xl' />
						<div className='absolute bottom-[-26px] left-[-12px] h-28 w-28 rounded-full bg-[rgba(191,225,219,0.16)] blur-3xl' />
						<div className='absolute inset-x-5 bottom-4 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.98),rgba(255,255,255,0))]' />
					</div>

					{siteContent.enableChristmas && <img src='/images/christmas/snow-5.webp' alt='' className='pointer-events-none absolute right-3 bottom-3 h-8 w-8 opacity-45' />}

					<div className='relative flex items-start justify-between gap-4'>
						<div className='space-y-3'>
							<div className='inline-flex items-center gap-2 rounded-full border border-white/95 bg-white/88 px-3 py-1.5 text-[10px] font-semibold tracking-[0.24em] text-[#b16e3e] uppercase shadow-[0_12px_24px_-22px_rgba(123,86,60,0.35)]'>
								<BookMarked className='h-3.5 w-3.5' />
								Daily English
							</div>
							<div className='flex items-center gap-2 text-[11px] font-medium text-[#9c7d69]'>
								<Sparkles className='h-3.5 w-3.5 text-[#df9151]' />
								<span>{sourceLabel}</span>
								<span className='text-[#d6bba7]'>·</span>
								<span>每天一句自然表达</span>
							</div>
						</div>
						<div className='rounded-[20px] border border-white/95 bg-white/86 p-3 text-[#d18b55] shadow-[0_16px_26px_-24px_rgba(123,86,60,0.35)]'>
							<Quote className='h-4 w-4' />
						</div>
					</div>

					<div className='relative space-y-3'>
						<div className='max-w-[92%] text-[18px] leading-[1.48] font-semibold text-[#5a4030] sm:text-[19px]'>
							{currentEntry?.english ?? '正在准备今天的英语句子...'}
						</div>
						<div className='max-w-[94%] rounded-[22px] border border-white/90 bg-white/82 px-4 py-3 text-[13px] leading-6 text-[#8a7161] shadow-[0_18px_30px_-28px_rgba(123,86,60,0.28)]'>
							{currentEntry?.translation ?? '加载后会显示中文释义与复习内容。'}
						</div>
					</div>

					<div className='relative flex items-end justify-between gap-4'>
						<div className='space-y-2'>
							<div className='flex flex-wrap gap-2'>
								<span className='rounded-full bg-white/88 px-3 py-1 text-[11px] font-medium text-[#bf7e4c] ring-1 ring-[#f3dfd0]'>待复习 {dueCount}</span>
								<span className='rounded-full bg-white/82 px-3 py-1 text-[11px] font-medium text-[#9a8070] ring-1 ring-white/95'>首页口语卡片</span>
							</div>
							<p className='text-[11px] leading-5 text-[#9b8576]'>点开继续跟读、复习和查看历史句子。</p>
						</div>
						<div className='inline-flex shrink-0 items-center gap-2 rounded-full border border-white/95 bg-white/88 px-4 py-2 text-[12px] font-semibold text-[#8f6c54] shadow-[0_12px_24px_-20px_rgba(123,86,60,0.28)]'>
							进入学习页
							<ArrowRight className='h-4 w-4' />
						</div>
					</div>
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
