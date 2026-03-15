'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { BookOpenText, CalendarClock, FilePenLine, PenSquare, Search } from 'lucide-react'
import { useBlogIndex } from '@/hooks/use-blog-index'
import { useReadArticles } from '@/hooks/use-read-articles'
import { cn } from '@/lib/utils'
import { isNotesCategory, NOTES_CATEGORY, NOTES_PAGE_SIZE } from './constants'

function formatDate(date: string) {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(date))
}

export default function NotesPage() {
	const { items, loading } = useBlogIndex()
	const { isRead } = useReadArticles()
	const [keyword, setKeyword] = useState('')
	const [page, setPage] = useState(1)
	const deferredKeyword = useDeferredValue(keyword)

	const notes = useMemo(() => {
		return [...items]
			.filter(item => isNotesCategory(item.category))
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	}, [items])

	const filteredNotes = useMemo(() => {
		const search = deferredKeyword.trim().toLowerCase()
		if (!search) return notes

		return notes.filter(item => {
			const searchableValues = [item.title, item.summary || '', item.category || '', ...(item.tags || [])]
			return searchableValues.some(value => value.toLowerCase().includes(search))
		})
	}, [notes, deferredKeyword])

	const totalPages = Math.max(1, Math.ceil(filteredNotes.length / NOTES_PAGE_SIZE))
	const pagedNotes = useMemo(() => {
		const start = (page - 1) * NOTES_PAGE_SIZE
		return filteredNotes.slice(start, start + NOTES_PAGE_SIZE)
	}, [filteredNotes, page])

	useEffect(() => {
		setPage(1)
	}, [deferredKeyword])

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages)
		}
	}, [page, totalPages])

	const latestUpdatedAt = notes[0]?.date

	return (
		<div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pt-24 pb-16'>
			<motion.section
				initial={{ opacity: 0, y: 18 }}
				animate={{ opacity: 1, y: 0 }}
				className='relative overflow-hidden rounded-[32px] border border-white/75 bg-[radial-gradient(circle_at_top_right,_rgba(255,210,167,0.38),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.92),_rgba(255,245,237,0.78))] p-8 shadow-[0_28px_80px_-50px_rgba(95,60,18,0.35)] backdrop-blur-md'>
				<div className='absolute top-6 right-6 h-32 w-32 rounded-full bg-[#ffd3ab]/45 blur-3xl' />
				<div className='absolute bottom-0 left-1/4 h-24 w-24 rounded-full bg-[#f5dfb0]/35 blur-3xl' />

				<div className='relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]'>
					<div className='space-y-5'>
						<div className='inline-flex items-center gap-2 rounded-full border border-[#f0d4af] bg-white/70 px-4 py-1.5 text-xs tracking-[0.22em] text-[#9b6a37] uppercase'>
							<FilePenLine className='h-3.5 w-3.5' />
							随笔页面
						</div>

						<div className='space-y-3'>
							<h1 className='text-primary text-3xl font-semibold md:text-5xl'>把灵感、观察和零散想法沉淀成一页页随笔</h1>
							<p className='text-secondary max-w-2xl text-sm leading-7 md:text-base'>
								这里专门收纳分类为“{NOTES_CATEGORY}”的文章。新内容会按发布时间从近到远排序展示，每页 6 条，方便你持续记录、回看和补充。
							</p>
						</div>

						<div className='flex flex-col gap-3 sm:flex-row'>
							<label className='relative min-w-0 flex-1'>
								<Search className='text-secondary absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
								<input
									type='text'
									value={keyword}
									onChange={event => setKeyword(event.target.value)}
									placeholder='搜索随笔关键词'
									className='focus:ring-brand/40 w-full rounded-2xl border border-white/80 bg-white/85 py-4 pr-4 pl-11 text-sm shadow-[0_12px_30px_-25px_rgba(0,0,0,0.35)] outline-none transition focus:ring-4'
								/>
							</label>

							<Link
								href={`/write?category=${encodeURIComponent(NOTES_CATEGORY)}&returnTo=${encodeURIComponent('/notes')}`}
								className='inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d96d25] px-5 py-4 text-sm font-medium text-white shadow-[0_18px_40px_-28px_rgba(217,109,37,0.8)] transition hover:translate-y-[-1px] hover:bg-[#c85f1a]'>
								<PenSquare className='h-4 w-4' />
								写随笔
							</Link>
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
						<div className='rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.35)]'>
							<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Notes Count</p>
							<div className='text-primary mt-3 text-4xl font-semibold'>{notes.length}</div>
							<p className='text-secondary mt-2 text-sm'>只展示分类为“{NOTES_CATEGORY}”的内容。</p>
						</div>

						<div className='rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.35)]'>
							<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Per Page</p>
							<div className='text-primary mt-3 text-4xl font-semibold'>{NOTES_PAGE_SIZE}</div>
							<p className='text-secondary mt-2 text-sm'>当前页使用更轻量的阅读密度，浏览起来更舒服。</p>
						</div>

						<div className='rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.35)]'>
							<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Latest Note</p>
							<div className='text-primary mt-3 text-2xl font-semibold'>{latestUpdatedAt ? formatDate(latestUpdatedAt) : '--'}</div>
							<p className='text-secondary mt-2 text-sm'>新发布的随笔会自动排到更前面。</p>
						</div>
					</div>
				</div>
			</motion.section>

			<section className='space-y-4'>
				<div className='flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='text-secondary text-xs tracking-[0.2em] uppercase'>Latest Notes</p>
						<h2 className='text-primary mt-2 text-2xl font-semibold'>{deferredKeyword.trim() ? '关键词匹配结果' : '按时间排序的随笔列表'}</h2>
					</div>
					<div className='text-secondary text-sm'>
						{filteredNotes.length} 条内容，当前第 {page} / {totalPages} 页
					</div>
				</div>

				{loading ? (
					<div className='rounded-[28px] border border-dashed border-white/80 bg-white/60 px-6 py-12 text-center text-sm text-[#84684b]'>正在加载随笔内容...</div>
				) : pagedNotes.length > 0 ? (
					<div className='space-y-4'>
						{pagedNotes.map((item, index) => (
							<motion.article
								key={item.slug}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.05 }}
								className='rounded-[28px] border border-white/80 bg-white/72 p-6 shadow-[0_24px_55px_-38px_rgba(0,0,0,0.35)] backdrop-blur-sm'>
								<div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
									<div className='min-w-0 flex-1'>
										<div className='flex flex-wrap items-center gap-3 text-xs text-[#8a7358]'>
											<span className='rounded-full bg-[#f8efe5] px-3 py-1'>{formatDate(item.date)}</span>
											<span className='inline-flex items-center gap-1'>
												<CalendarClock className='h-3.5 w-3.5' />
												按最新时间排序
											</span>
											{isRead(item.slug) && <span className='rounded-full border border-[#ead8c5] bg-[#fff8f1] px-3 py-1'>已读</span>}
										</div>

										<h3 className='text-primary mt-4 text-2xl font-semibold'>{item.title || item.slug}</h3>
										<p className='text-secondary mt-3 text-sm leading-7'>{item.summary || '这篇随笔还没有填写摘要，点击进去可以阅读完整内容。'}</p>

										<div className='mt-5 flex flex-wrap gap-2'>
											<span className='rounded-full border border-[#efdfcf] bg-[#fffaf4] px-3 py-1 text-xs text-[#8e7456]'>#{NOTES_CATEGORY}</span>
											{(item.tags || []).map(tag => (
												<span key={tag} className='rounded-full border border-[#efdfcf] bg-[#fffaf4] px-3 py-1 text-xs text-[#8e7456]'>
													#{tag}
												</span>
											))}
										</div>
									</div>

									<Link
										href={`/blog/${item.slug}`}
										className='inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-[#fffaf4] px-5 py-3 text-sm font-medium text-[#7e5f3f] transition hover:bg-white lg:min-w-[140px]'>
										<BookOpenText className='h-4 w-4' />
										阅读随笔
									</Link>
								</div>
							</motion.article>
						))}
					</div>
				) : (
					<div className='rounded-[28px] border border-dashed border-white/80 bg-white/60 px-6 py-12 text-center text-sm text-[#84684b]'>
						{deferredKeyword.trim() ? '没有找到匹配的随笔，可以换个关键词再试。' : '还没有随笔内容，点击右上角“写随笔”开始发布第一篇。'}
					</div>
				)}
			</section>

			{totalPages > 1 && (
				<section className='flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/80 bg-white/72 px-5 py-4 shadow-[0_20px_40px_-34px_rgba(0,0,0,0.35)] backdrop-blur-sm'>
					<div className='text-secondary text-sm'>每页 6 条内容，方便快速翻阅最近的记录。</div>
					<div className='flex items-center gap-2'>
						<button
							type='button'
							onClick={() => setPage(prev => Math.max(1, prev - 1))}
							disabled={page === 1}
							className='rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm text-[#7d6246] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'>
							上一页
						</button>
						{Array.from({ length: totalPages }, (_, index) => {
							const nextPage = index + 1
							return (
								<button
									key={nextPage}
									type='button'
									onClick={() => setPage(nextPage)}
									className={cn(
										'flex h-10 w-10 items-center justify-center rounded-full border text-sm transition',
										page === nextPage ? 'border-transparent bg-[#d97224] text-white' : 'border-white/80 bg-white/80 text-[#7d6246] hover:bg-white'
									)}>
									{nextPage}
								</button>
							)
						})}
						<button
							type='button'
							onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
							disabled={page === totalPages}
							className='rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm text-[#7d6246] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'>
							下一页
						</button>
					</div>
				</section>
			)}
		</div>
	)
}
