'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, Brain, CheckCheck, Headphones, History, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDailyEnglish } from '@/hooks/use-daily-english'
import { useAuthStore } from '@/hooks/use-auth'
import type { DailyEnglishEntry } from '@/features/daily-english/data'
import type { ConfirmedDailyEnglishEntry } from '@/lib/daily-english-types'
import { pushConfirmedDailyEnglish } from './services/push-confirmed-daily-english'
import {
	ensureDailyEnglishSeen,
	getDailyEnglishReviewStats,
	getDueDailyEnglishEntries,
	readDailyEnglishReviewState,
	reviewDailyEnglishEntry,
	toDateKey,
	writeDailyEnglishReviewState,
	type DailyEnglishReviewRecord,
	type DailyEnglishReviewState
} from '@/features/daily-english/review'

const REVIEW_RHYTHM = ['第 1 天', '第 2 天', '第 4 天', '第 7 天', '第 15 天', '第 30 天', '第 60 天']

function formatDateLabel(date = new Date()) {
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

function formatReviewDate(dateKey?: string) {
	if (!dateKey) return '暂未安排'
	return dateKey.replaceAll('-', '.')
}

function getReviewStatusLabel(record?: DailyEnglishReviewRecord) {
	if (!record) return '未开始'
	if (record.level >= 4) return '掌握中'
	if (record.level >= 2) return '复习中'
	return '刚学过'
}

function buildConfirmedEntry(entry: DailyEnglishEntry, source: { label: string; url: string; fallback: boolean }): ConfirmedDailyEnglishEntry {
	return {
		...entry,
		confirmedAt: new Date().toISOString(),
		sourceLabel: source.label,
		sourceUrl: source.url,
		sourceFallback: source.fallback
	}
}

function getScopedReviewStats(entries: DailyEnglishEntry[], state: DailyEnglishReviewState, date: Date = new Date()) {
	const scopedState = entries.reduce<DailyEnglishReviewState>((result, entry) => {
		if (state[entry.id]) {
			result[entry.id] = state[entry.id]
		}
		return result
	}, {})

	return getDailyEnglishReviewStats(scopedState, date)
}

export default function DailyEnglishPage() {
	const { data, isLoading, mutate } = useDailyEnglish()
	const { isAuth, setPrivateKey } = useAuthStore()
	const keyInputRef = useRef<HTMLInputElement>(null)
	const [progress, setProgress] = useState<DailyEnglishReviewState>({})
	const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
	const [isSpeaking, setIsSpeaking] = useState(false)
	const [isConfirming, setIsConfirming] = useState(false)
	const [pendingConfirmEntry, setPendingConfirmEntry] = useState<DailyEnglishEntry | null>(null)

	const history = data?.history ?? []
	const confirmedEntries = data?.confirmed ?? []
	const reviewEntries = confirmedEntries.length > 0 ? confirmedEntries : history

	useEffect(() => {
		if (!data?.current) return

		setActiveEntryId(prev => {
			if (!prev) return data.current.id
			const allEntries = [...confirmedEntries, ...history]
			return allEntries.some(entry => entry.id === prev) ? prev : data.current.id
		})

		const currentState = readDailyEnglishReviewState()
		const nextState = confirmedEntries.length === 0 ? ensureDailyEnglishSeen(currentState, data.current.id) : currentState
		if (nextState !== currentState) {
			writeDailyEnglishReviewState(nextState)
		}
		setProgress(nextState)
	}, [confirmedEntries, data?.current, history])

	useEffect(() => {
		return () => {
			if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
				window.speechSynthesis.cancel()
			}
		}
	}, [])

	const activeEntry = useMemo(() => {
		const allEntries = [...confirmedEntries, ...history]
		if (!allEntries.length) return data?.current ?? null
		return allEntries.find(entry => entry.id === activeEntryId) ?? data?.current ?? allEntries[0]
	}, [activeEntryId, confirmedEntries, data?.current, history])

	const reviewQueue = useMemo(() => getDueDailyEnglishEntries(reviewEntries, progress, new Date(), 4), [reviewEntries, progress])
	const stats = useMemo(() => getScopedReviewStats(reviewEntries, progress), [reviewEntries, progress])
	const activeProgress = activeEntry ? progress[activeEntry.id] : undefined
	const todayIndex = data?.current ? history.findIndex(entry => entry.id === data.current.id) + 1 : 0
	const currentIsConfirmed = Boolean(
		data?.current &&
			confirmedEntries.some(
				entry =>
					entry.id === data.current?.id ||
					(entry.english === data.current?.english && entry.translation === data.current?.translation)
			)
	)
	const libraryEntries = confirmedEntries.length > 0 ? confirmedEntries : history
	const libraryTitle = confirmedEntries.length > 0 ? '已确认句库' : '历史句子'
	const libraryDescription =
		confirmedEntries.length > 0
			? '这里展示你已经确认收录到仓库的句子，后续复习会优先基于这批句子进行。'
			: '这里展示当前接口返回的历史句子，你可以先浏览、跟读，再把值得长期复习的句子确认收录。'

	const handlePlay = (entry: DailyEnglishEntry) => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
			toast.error('当前浏览器不支持语音播放')
			return
		}

		const synth = window.speechSynthesis
		if (isSpeaking) {
			synth.cancel()
			setIsSpeaking(false)
			return
		}

		const utterance = new SpeechSynthesisUtterance(entry.english)
		utterance.lang = 'en-US'
		utterance.rate = 0.92
		utterance.pitch = 1
		utterance.onend = () => setIsSpeaking(false)
		utterance.onerror = () => {
			setIsSpeaking(false)
			toast.error('语音播放失败，请稍后重试')
		}

		setIsSpeaking(true)
		synth.cancel()
		window.setTimeout(() => synth.speak(utterance), 0)
	}

	const syncConfirmedProgress = (entryId: string) => {
		const currentState = readDailyEnglishReviewState()
		const nextState = ensureDailyEnglishSeen(currentState, entryId)
		writeDailyEnglishReviewState(nextState)
		setProgress(nextState)
	}

	const confirmEntry = async (entry: DailyEnglishEntry) => {
		if (!data) return

		setIsConfirming(true)

		try {
			const result = await pushConfirmedDailyEnglish(buildConfirmedEntry(entry, data.source))
			syncConfirmedProgress(entry.id)
			setActiveEntryId(entry.id)

			await mutate(
				current =>
					current
						? {
								...current,
								confirmed: result.entries
						  }
						: current,
				{ revalidate: false }
			)

			if (result.alreadyExists) {
				toast.info('这个句子已经在已确认句库里了')
			} else {
				toast.success('已确认收录，后续会加入遗忘曲线复习')
			}
		} catch (error: any) {
			console.error('Failed to confirm daily English:', error)
			toast.error(`确认收录失败: ${error?.message || '请稍后再试'}`)
		} finally {
			setIsConfirming(false)
			setPendingConfirmEntry(null)
		}
	}

	const handleConfirmClick = async () => {
		if (!data?.current || isConfirming) return

		if (!isAuth) {
			setPendingConfirmEntry(data.current)
			keyInputRef.current?.click()
			return
		}

		await confirmEntry(data.current)
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			await setPrivateKey(text)

			if (pendingConfirmEntry) {
				await confirmEntry(pendingConfirmEntry)
			}
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('私钥读取失败，请重新选择有效的 .pem 文件')
			setPendingConfirmEntry(null)
		}
	}

	const handleReview = (entryId: string, feedback: 'good' | 'again') => {
		const nextState = reviewDailyEnglishEntry(progress, entryId, feedback)
		writeDailyEnglishReviewState(nextState)
		setProgress(nextState)
		setActiveEntryId(entryId)
	}

	if (isLoading && !data) {
		return (
			<div className='mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-28 sm:px-6'>
				<div className='h-14 animate-pulse rounded-full bg-white/55' />
				<div className='h-[320px] animate-pulse rounded-[36px] bg-white/60' />
				<div className='grid gap-6 lg:grid-cols-2'>
					<div className='h-[260px] animate-pulse rounded-[32px] bg-white/55' />
					<div className='h-[260px] animate-pulse rounded-[32px] bg-white/55' />
				</div>
			</div>
		)
	}

	if (!activeEntry || !data) {
		return null
	}

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async event => {
					const file = event.target.files?.[0]
					if (file) await handleChoosePrivateKey(file)
					event.currentTarget.value = ''
				}}
			/>

			<div className='relative overflow-hidden px-4 pb-14 pt-28 sm:px-6'>
				<div className='pointer-events-none absolute inset-0 overflow-hidden'>
					<div className='absolute left-[12%] top-[-120px] h-72 w-72 rounded-full bg-[rgba(217,109,37,0.12)] blur-3xl' />
					<div className='absolute right-[-80px] top-[22%] h-80 w-80 rounded-full bg-[rgba(53,191,171,0.12)] blur-3xl' />
					<div className='absolute bottom-[-120px] left-[30%] h-72 w-72 rounded-full bg-[rgba(255,255,255,0.55)] blur-3xl' />
				</div>

				<div className='relative mx-auto max-w-6xl space-y-8'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<Link
							href='/'
							className='inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-xs font-medium text-[#75553a] shadow-[0_12px_32px_-22px_rgba(70,36,17,0.8)] transition hover:border-[#d99a6a]/40 hover:text-[#c16424]'>
							<ArrowLeft className='h-3.5 w-3.5' />
							返回首页
						</Link>
						<div className='rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#886a56]'>
							{formatDateLabel()} 的每日英语
						</div>
					</div>

					<div className='grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]'>
						<section className='relative overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,250,244,0.94),rgba(255,240,228,0.98)_55%,rgba(249,232,218,0.96))] p-6 shadow-[0_40px_120px_-65px_rgba(88,41,17,0.45)] sm:p-8'>
							<div className='absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-8 rounded-full bg-[rgba(217,109,37,0.14)] blur-3xl' />
							<div className='absolute bottom-0 left-0 h-36 w-36 -translate-x-10 translate-y-10 rounded-full bg-[rgba(53,191,171,0.16)] blur-3xl' />

							<div className='relative flex flex-col gap-8'>
								<div className='flex flex-wrap items-start justify-between gap-4'>
									<div className='space-y-4'>
										<div className='inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a5b2c]'>
											<Sparkles className='h-3.5 w-3.5' />
											Daily English
										</div>
										<div>
											<div className='text-[12px] font-medium uppercase tracking-[0.22em] text-[#94735c]'>
												Today&apos;s sentence #{String(Math.max(todayIndex, 1)).padStart(2, '0')}
											</div>
											<h1 translate='no' className='mt-3 max-w-3xl text-3xl font-semibold leading-tight text-[#4c311f] sm:text-5xl'>
												{activeEntry.english}
											</h1>
											<p className='mt-4 max-w-2xl text-base leading-8 text-[#735746] sm:text-lg'>{activeEntry.translation}</p>
										</div>
									</div>

									<div className='flex flex-wrap items-center justify-end gap-3'>
										<button
											type='button'
											onClick={() => handlePlay(activeEntry)}
											translate='no'
											aria-pressed={isSpeaking}
											aria-label={isSpeaking ? 'Stop speaking' : 'Play sentence audio'}
											className='inline-flex items-center gap-2 rounded-full bg-[#d96d25] px-4 py-3 text-sm font-medium text-white shadow-[0_20px_40px_-26px_rgba(217,109,37,0.9)] transition hover:translate-y-[-1px] hover:bg-[#c85f1a]'>
											<span className='relative h-4 w-4'>
												<Volume2 className={cn('absolute inset-0 h-4 w-4 transition-opacity', isSpeaking && 'opacity-0')} />
												<VolumeX className={cn('absolute inset-0 h-4 w-4 transition-opacity', !isSpeaking && 'opacity-0')} />
											</span>
											<span>Speak sentence</span>
										</button>
										<button
											type='button'
											onClick={handleConfirmClick}
											disabled={isConfirming || currentIsConfirmed}
											className={cn(
												'inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition',
												currentIsConfirmed
													? 'cursor-default border border-[#d9e7d8] bg-[#f4fbf2] text-[#618154]'
													: 'border border-white/90 bg-white/88 text-[#7f5635] shadow-[0_20px_40px_-28px_rgba(88,41,17,0.35)] hover:translate-y-[-1px]'
											)}>
											<CheckCheck className='h-4 w-4' />
											<span>
												{currentIsConfirmed ? '已收录到句库' : isConfirming ? '收录中...' : isAuth ? '确认收录' : '导入私钥后收录'}
											</span>
										</button>
									</div>
								</div>

								<div className='rounded-[28px] border border-white/85 bg-white/70 px-5 py-4 text-sm leading-7 text-[#735746] shadow-[0_30px_60px_-45px_rgba(0,0,0,0.35)]'>
									点击“确认收录”后，当前句子会被写入仓库配置文件并进入你的长期复习池，后续遗忘曲线会优先从这些已确认句子里挑选复习内容。
								</div>

								<div className='grid gap-4 md:grid-cols-[1.05fr_0.95fr]'>
									<div className='rounded-[28px] border border-white/85 bg-white/72 p-5 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.4)]'>
										<div className='flex items-center gap-2 text-sm font-semibold text-[#7f5635]'>
											<Headphones className='h-4 w-4' />
											口语信息
										</div>
										<div className='mt-4 text-sm leading-7 text-[#705748]'>
											<p>
												<span className='font-semibold text-[#4c311f]'>读法：</span>
												<span translate='no'>{activeEntry.pronunciation}</span>
											</p>
											<p className='mt-3'>
												<span className='font-semibold text-[#4c311f]'>适用场景：</span>
												{activeEntry.scenario}
											</p>
											<div className='mt-4 flex flex-wrap gap-2'>
												{activeEntry.tags.map(tag => (
													<span key={tag} className='rounded-full border border-[#e8d4c7] bg-[#fff7f1] px-3 py-1 text-xs font-medium text-[#8a6040]'>
														#{tag}
													</span>
												))}
											</div>
										</div>
									</div>

									<div className='rounded-[28px] border border-white/85 bg-[#fffdf8]/85 p-5 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.4)]'>
										<div className='flex items-center gap-2 text-sm font-semibold text-[#7f5635]'>
											<Brain className='h-4 w-4' />
											使用思考
										</div>
										<p className='mt-4 text-sm leading-8 text-[#6d5344]'>{activeEntry.reflection}</p>
										<div className='mt-5 rounded-2xl bg-[linear-gradient(135deg,rgba(53,191,171,0.10),rgba(217,109,37,0.08))] px-4 py-3 text-xs leading-6 text-[#6a5a4b]'>
											当前句子默认来自 Tatoeba 官方接口；如果外部接口短暂不可用，页面会自动回退到本地句库，保证学习体验不断档。
										</div>
									</div>
								</div>
							</div>
						</section>

						<aside className='space-y-4'>
							<div className='rounded-[30px] border border-white/80 bg-white/72 p-5 shadow-[0_35px_80px_-52px_rgba(0,0,0,0.45)]'>
								<div className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94735c]'>复习总览</div>
								<div className='mt-4 grid grid-cols-3 gap-3'>
									<StatCard label='已学习' value={stats.studied} />
									<StatCard label='待复习' value={stats.due} highlight />
									<StatCard label='掌握中' value={stats.mastered} />
								</div>
								<div className='mt-5 rounded-[24px] border border-dashed border-[#ead8cb] bg-[#fffaf5] p-4'>
									<div className='text-sm font-semibold text-[#6c4a31]'>遗忘曲线节奏</div>
									<div className='mt-3 flex flex-wrap gap-2'>
										{REVIEW_RHYTHM.map(step => (
											<span key={step} className='rounded-full bg-white px-3 py-1 text-xs font-medium text-[#8b674d] ring-1 ring-[#eadacd]'>
												{step}
											</span>
										))}
									</div>
									<p className='mt-3 text-xs leading-6 text-[#8a7463]'>每次点击“记住了”会推迟下次复习时间，点击“再看一遍”会更快安排下一轮复习。</p>
								</div>
							</div>

							<div className='rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,247,240,0.95))] p-5 shadow-[0_35px_80px_-52px_rgba(0,0,0,0.45)]'>
								<div className='text-[11px] font-semibold uppercase tracking-[0.24em] text-[#94735c]'>当前状态</div>
								<div className='mt-4 space-y-3 text-sm leading-7 text-[#6f5646]'>
									<InfoBlock label='学习阶段' value={getReviewStatusLabel(activeProgress)} />
									<InfoBlock label='下次复习' value={formatReviewDate(activeProgress?.nextReviewOn)} />
									<InfoBlock label='已确认句子' value={`${confirmedEntries.length} 条`} />
									<div className='rounded-2xl bg-white/85 px-4 py-3'>
										<div className='text-xs text-[#9a806e]'>数据来源</div>
										<a
											href={data.source.url}
											target='_blank'
											rel='noreferrer'
											className='mt-1 inline-flex text-sm font-semibold text-[#4c311f] underline decoration-[#dba073] underline-offset-4'>
											{data.source.label}
										</a>
									</div>
								</div>
							</div>
						</aside>
					</div>

					<section className='grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]'>
						<div className='rounded-[32px] border border-white/80 bg-white/72 p-5 shadow-[0_35px_80px_-55px_rgba(0,0,0,0.45)] sm:p-6'>
							<div className='flex items-center gap-2 text-sm font-semibold text-[#6d4a30]'>
								<CheckCheck className='h-4 w-4' />
								今日复习
							</div>
							<p className='mt-2 text-sm leading-7 text-[#866d5d]'>
								{confirmedEntries.length > 0
									? '当前复习队列优先来自你已经确认收录的句子，这样长期积累会更稳定。'
									: '你还没有建立自己的确认句库，当前先使用接口历史句子进行复习演练。'}
							</p>

							<div className='mt-5 space-y-3'>
								{reviewQueue.length === 0 ? (
									<div className='rounded-[26px] border border-dashed border-[#e8d7ca] bg-[#fffaf5] px-5 py-6 text-sm leading-7 text-[#866d5d]'>
										今天没有到期的复习内容。你可以先确认一些句子，或者从右侧句库里挑一句继续学习。
									</div>
								) : (
									reviewQueue.map(entry => {
										const entryProgress = progress[entry.id]
										return (
											<div key={entry.id} className='rounded-[26px] border border-white/85 bg-[#fffdf9] p-4 shadow-[0_22px_40px_-35px_rgba(0,0,0,0.4)]'>
												<button type='button' onClick={() => setActiveEntryId(entry.id)} className='w-full text-left'>
													<div className='flex items-start justify-between gap-4'>
														<div>
															<div translate='no' className='text-base font-semibold text-[#4c311f]'>
																{entry.english}
															</div>
															<div className='mt-2 text-sm text-[#7f6454]'>{entry.translation}</div>
														</div>
														<span className='shrink-0 rounded-full bg-[#fff2e5] px-3 py-1 text-[11px] font-medium text-[#b76a2e]'>
															{entryProgress?.nextReviewOn === toDateKey() ? '今天复习' : '待安排'}
														</span>
													</div>
												</button>
												<div className='mt-4 flex flex-wrap gap-2'>
													<button
														type='button'
														onClick={() => handleReview(entry.id, 'again')}
														className='rounded-full border border-[#ead7ca] bg-white px-4 py-2 text-xs font-medium text-[#7c5a42] transition hover:bg-[#fff7f0]'>
														再看一遍
													</button>
													<button
														type='button'
														onClick={() => handleReview(entry.id, 'good')}
														className='rounded-full bg-[#d96d25] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#c85f1a]'>
														记住了
													</button>
												</div>
											</div>
										)
									})
								)}
							</div>
						</div>

						<div className='rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(251,245,238,0.95))] p-5 shadow-[0_35px_80px_-55px_rgba(0,0,0,0.45)] sm:p-6'>
							<div className='flex items-center gap-2 text-sm font-semibold text-[#6d4a30]'>
								<History className='h-4 w-4' />
								{libraryTitle}
							</div>
							<p className='mt-2 text-sm leading-7 text-[#866d5d]'>{libraryDescription}</p>

							<div className='mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
								{libraryEntries.map((entry, index) => {
									const record = progress[entry.id]
									return (
										<button
											type='button'
											key={entry.id}
											onClick={() => setActiveEntryId(entry.id)}
											className={cn(
												'rounded-[24px] border p-4 text-left transition',
												activeEntry.id === entry.id
													? 'border-[#dba073] bg-[#fff7f1] shadow-[0_24px_45px_-36px_rgba(201,109,44,0.8)]'
													: 'border-white/85 bg-white/72 hover:border-[#ead8cb] hover:bg-white'
											)}>
											<div className='flex items-start justify-between gap-3'>
												<span className='rounded-full bg-[#f7eee6] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9e6e47]'>
													#{String(index + 1).padStart(2, '0')}
												</span>
												<span className='text-[11px] font-medium text-[#9a7f6c]'>{getReviewStatusLabel(record)}</span>
											</div>
											<div translate='no' className='mt-3 line-clamp-3 text-sm font-medium leading-6 text-[#4f3522]'>
												{entry.english}
											</div>
											<div className='mt-2 line-clamp-2 text-xs leading-6 text-[#7d6555]'>{entry.translation}</div>
										</button>
									)
								})}
							</div>
						</div>
					</section>
				</div>
			</div>
		</>
	)
}

function StatCard({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
	return (
		<div className={cn('rounded-[22px] px-4 py-4', highlight ? 'bg-[#fff2e5]' : 'bg-[#fffaf5]')}>
			<div className='text-[11px] font-medium uppercase tracking-[0.18em] text-[#977a66]'>{label}</div>
			<div className='mt-2 text-2xl font-semibold text-[#4c311f]'>{value}</div>
		</div>
	)
}

function InfoBlock({ label, value }: { label: string; value: string }) {
	return (
		<div className='rounded-2xl bg-white/85 px-4 py-3'>
			<div className='text-xs text-[#9a806e]'>{label}</div>
			<div className='mt-1 font-semibold text-[#4c311f]'>{value}</div>
		</div>
	)
}
