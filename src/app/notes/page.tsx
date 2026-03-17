'use client'

import Link from 'next/link'
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { BookOpenText, CalendarClock, FilePenLine, PenSquare, Search, SquarePen } from 'lucide-react'
import { useBlogIndex, type BlogIndexItem } from '@/hooks/use-blog-index'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useReadArticles } from '@/hooks/use-read-articles'
import { filterNoteItems, NOTES_CATEGORY } from '@/lib/blog-filters'

type NoteContentState = {
	markdown?: string
	loading: boolean
	error?: string
}

function formatDate(date: string) {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(new Date(date))
}

function markdownToPlainText(markdown?: string) {
	return (markdown || '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
		.replace(/^>\s?/gm, '')
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/[*_~>-]/g, ' ')
		.replace(/\n+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
}

function buildNoteLead(item: BlogIndexItem, markdown?: string) {
	if (item.summary?.trim()) {
		return item.summary.trim()
	}

	const plainText = markdownToPlainText(markdown)
	if (!plainText) {
		return '这篇随笔还在整理中，正文加载完成后会直接显示在这里。'
	}

	return `${plainText.slice(0, 120)}${plainText.length > 120 ? '...' : ''}`
}

function estimateReadingMinutes(markdown?: string) {
	const plainText = markdownToPlainText(markdown)
	if (!plainText) return 1
	return Math.max(1, Math.round(plainText.length / 320))
}

function NoteArticleBody({ markdown, loading, error }: { markdown?: string; loading: boolean; error?: string }) {
	const { content, loading: rendering } = useMarkdownRender(markdown || '')

	if (loading || (markdown && rendering)) {
		return (
			<div className='space-y-3'>
				<div className='h-4 w-24 rounded-full bg-[#ead8c5]/80' />
				<div className='h-4 w-full rounded-full bg-[#f1e4d5]/80' />
				<div className='h-4 w-[92%] rounded-full bg-[#f1e4d5]/70' />
				<div className='h-4 w-[78%] rounded-full bg-[#f1e4d5]/60' />
			</div>
		)
	}

	if (error) {
		return <div className='rounded-2xl border border-[#f2d6d1] bg-[#fff7f5] px-4 py-3 text-sm text-[#a65b4d]'>{error}</div>
	}

	if (!markdown) {
		return <div className='text-secondary text-sm'>这篇随笔暂时没有正文内容。</div>
	}

	return <div className='prose max-w-none text-[15px]'>{content}</div>
}

export default function NotesPage() {
	const { items, loading } = useBlogIndex()
	const { isRead } = useReadArticles()
	const [keyword, setKeyword] = useState('')
	const [noteContents, setNoteContents] = useState<Record<string, NoteContentState>>({})
	const deferredKeyword = useDeferredValue(keyword)

	const notes = useMemo(() => {
		return filterNoteItems(items).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	}, [items])

	useEffect(() => {
		let cancelled = false

		if (notes.length === 0) {
			setNoteContents({})
			return
		}

		startTransition(() => {
			setNoteContents(prev =>
				Object.fromEntries(
					notes.map(note => [
						note.slug,
						{
							markdown: prev[note.slug]?.markdown,
							error: undefined,
							loading: !prev[note.slug]?.markdown
						}
					])
				)
			)
		})

		void Promise.allSettled(
			notes.map(async note => {
				const response = await fetch(`/blogs/${encodeURIComponent(note.slug)}/index.md`, {
					cache: 'no-store'
				})

				if (!response.ok) {
					throw new Error('正文加载失败')
				}

				return {
					slug: note.slug,
					markdown: await response.text()
				}
			})
		).then(results => {
			if (cancelled) return

			startTransition(() => {
				setNoteContents(prev => {
					const next = { ...prev }

					results.forEach((result, index) => {
						const slug = notes[index]?.slug
						if (!slug) return

						if (result.status === 'fulfilled') {
							next[slug] = {
								markdown: result.value.markdown,
								loading: false
							}
							return
						}

						next[slug] = {
							markdown: prev[slug]?.markdown,
							loading: false,
							error: '这篇随笔的正文暂时没有加载成功。'
						}
					})

					return next
				})
			})
		})

		return () => {
			cancelled = true
		}
	}, [notes])

	const filteredNotes = useMemo(() => {
		const search = deferredKeyword.trim().toLowerCase()
		if (!search) return notes

		return notes.filter(item => {
			const content = noteContents[item.slug]?.markdown || ''
			const searchableValues = [item.title, item.summary || '', item.category || '', content, ...(item.tags || [])]
			return searchableValues.some(value => value.toLowerCase().includes(search))
		})
	}, [deferredKeyword, noteContents, notes])

	const latestUpdatedAt = notes[0]?.date
	const loadedCount = Object.values(noteContents).filter(item => !!item.markdown).length

	return (
		<div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pt-24 pb-16'>
			<motion.section
				initial={{ opacity: 0, y: 18 }}
				animate={{ opacity: 1, y: 0 }}
				className='relative overflow-hidden rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top_right,_rgba(255,214,169,0.5),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(248,231,208,0.8),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(255,245,236,0.78))] p-8 shadow-[0_35px_90px_-52px_rgba(104,64,21,0.4)] backdrop-blur-md'>
				<div className='absolute top-8 right-8 h-36 w-36 rounded-full bg-[#ffd2a8]/45 blur-3xl' />
				<div className='absolute bottom-2 left-8 h-28 w-28 rounded-full bg-[#f6e6c9]/55 blur-3xl' />

				<div className='relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'>
					<div className='space-y-5'>
						<div className='inline-flex items-center gap-2 rounded-full border border-[#efcfaa] bg-white/78 px-4 py-1.5 text-xs tracking-[0.24em] text-[#99673b] uppercase'>
							<FilePenLine className='h-3.5 w-3.5' />
							随笔阅读页
						</div>

						<div className='space-y-3'>
							<h1 className='text-primary text-3xl font-semibold md:text-5xl'>把所有随笔单独收拢在一起，像翻一本持续更新的个人手记</h1>
							<p className='text-secondary max-w-3xl text-sm leading-7 md:text-base'>
								这里会集中展示分类为“{NOTES_CATEGORY}”的内容。每一篇都会直接展开正文，你不用再先进入文章页，灵感、观察和阶段性思考都能在这里连续阅读。
							</p>
						</div>

						<div className='flex flex-col gap-3 sm:flex-row'>
							<label className='relative min-w-0 flex-1'>
								<Search className='text-secondary absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
								<input
									type='text'
									value={keyword}
									onChange={event => setKeyword(event.target.value)}
									placeholder='搜索标题、标签或正文关键词'
									className='focus:ring-brand/40 w-full rounded-2xl border border-white/80 bg-white/88 py-4 pr-4 pl-11 text-sm shadow-[0_14px_35px_-28px_rgba(0,0,0,0.35)] outline-none transition focus:ring-4'
								/>
							</label>

							<Link
								href={`/write?category=${encodeURIComponent(NOTES_CATEGORY)}&returnTo=${encodeURIComponent('/notes')}`}
								className='inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d96d25] px-5 py-4 text-sm font-medium text-white shadow-[0_20px_42px_-28px_rgba(217,109,37,0.8)] transition hover:translate-y-[-1px] hover:bg-[#c65f1a]'>
								<PenSquare className='h-4 w-4' />
								写随笔
							</Link>
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
						<div className='rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_22px_46px_-36px_rgba(0,0,0,0.35)]'>
							<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Notes Count</p>
							<div className='text-primary mt-3 text-4xl font-semibold'>{notes.length}</div>
							<p className='text-secondary mt-2 text-sm'>随笔已经从文章页分离，这里就是完整列表。</p>
						</div>

						<div className='rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_22px_46px_-36px_rgba(0,0,0,0.35)]'>
							<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Loaded Bodies</p>
							<div className='text-primary mt-3 text-4xl font-semibold'>{loadedCount}</div>
							<p className='text-secondary mt-2 text-sm'>正文会在页面内直接渲染，方便连续阅读和检索。</p>
						</div>

						<div className='rounded-[24px] border border-white/75 bg-white/72 p-5 shadow-[0_22px_46px_-36px_rgba(0,0,0,0.35)]'>
							<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Latest Note</p>
							<div className='text-primary mt-3 text-2xl font-semibold'>{latestUpdatedAt ? formatDate(latestUpdatedAt) : '--'}</div>
							<p className='text-secondary mt-2 text-sm'>默认按时间倒序排列，最近的思考永远在最前面。</p>
						</div>
					</div>
				</div>
			</motion.section>

			<section className='space-y-4'>
				<div className='flex flex-wrap items-end justify-between gap-4'>
					<div>
						<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Notes Stream</p>
						<h2 className='text-primary mt-2 text-2xl font-semibold'>{deferredKeyword.trim() ? '正文检索结果' : '按发布时间展开的随笔正文'}</h2>
					</div>
					<div className='text-secondary text-sm'>当前展示 {filteredNotes.length} 篇随笔</div>
				</div>

				{loading ? (
					<div className='rounded-[28px] border border-dashed border-white/80 bg-white/60 px-6 py-12 text-center text-sm text-[#84684b]'>正在整理随笔目录...</div>
				) : filteredNotes.length > 0 ? (
					<div className='space-y-6'>
						{filteredNotes.map((item, index) => {
							const noteState = noteContents[item.slug] || { loading: true }
							const readingMinutes = estimateReadingMinutes(noteState.markdown)
							const noteLead = buildNoteLead(item, noteState.markdown)

							return (
								<motion.article
									key={item.slug}
									initial={{ opacity: 0, y: 18 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.05 }}
									className='relative overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.94),_rgba(255,248,242,0.86))] shadow-[0_28px_65px_-42px_rgba(0,0,0,0.35)]'>
									<div className='absolute top-0 left-0 h-full w-1 bg-[linear-gradient(180deg,_#d86f27,_rgba(216,111,39,0.15))]' />

									{item.cover && (
										<div className='border-b border-white/80 bg-[#f7efe6]/80 p-3'>
											<img src={item.cover} alt={item.title || item.slug} className='h-[220px] w-full rounded-[24px] object-cover' />
										</div>
									)}

									<div className='grid gap-6 p-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:p-8'>
										<aside className='space-y-4'>
											<div className='rounded-[24px] border border-white/80 bg-white/76 p-4 shadow-[0_16px_35px_-28px_rgba(0,0,0,0.3)]'>
												<p className='text-secondary text-xs tracking-[0.2em] uppercase'>Published</p>
												<div className='text-primary mt-2 text-lg font-semibold'>{formatDate(item.date)}</div>
												<div className='text-secondary mt-2 inline-flex items-center gap-1 text-sm'>
													<CalendarClock className='h-3.5 w-3.5' />
													约 {readingMinutes} 分钟阅读
												</div>
											</div>

											<div className='rounded-[24px] border border-white/80 bg-white/76 p-4 shadow-[0_16px_35px_-28px_rgba(0,0,0,0.3)]'>
												<p className='text-secondary text-xs tracking-[0.2em] uppercase'>Tags</p>
												<div className='mt-3 flex flex-wrap gap-2'>
													<span className='rounded-full border border-[#efdfcf] bg-[#fffaf4] px-3 py-1 text-xs text-[#8e7456]'>#{NOTES_CATEGORY}</span>
													{(item.tags || []).map(tag => (
														<span key={tag} className='rounded-full border border-[#efdfcf] bg-[#fffaf4] px-3 py-1 text-xs text-[#8e7456]'>
															#{tag}
														</span>
													))}
												</div>
											</div>

											<div className='flex flex-wrap gap-2'>
												<Link
													href={`/write/${item.slug}`}
													className='inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-2 text-sm text-[#7d6246] transition hover:bg-white'>
													<SquarePen className='h-4 w-4' />
													编辑
												</Link>
												<Link
													href={`/blog/${item.slug}`}
													className='inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-[#fff7ef] px-4 py-2 text-sm text-[#7d6246] transition hover:bg-white'>
													<BookOpenText className='h-4 w-4' />
													单篇页
												</Link>
											</div>
										</aside>

										<div className='min-w-0'>
											<div className='flex flex-wrap items-center gap-2 text-xs text-[#8a7358]'>
												<span className='rounded-full bg-[#f8efe5] px-3 py-1'>随笔</span>
												{isRead(item.slug) && <span className='rounded-full border border-[#ead8c5] bg-[#fff8f1] px-3 py-1'>已读</span>}
											</div>

											<h3 className='text-primary mt-4 text-3xl font-semibold leading-tight'>{item.title || item.slug}</h3>
											<p className='text-secondary mt-4 max-w-3xl text-sm leading-7 md:text-base'>{noteLead}</p>

											<div className='mt-6 rounded-[28px] border border-white/80 bg-white/78 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] md:p-8'>
												<NoteArticleBody markdown={noteState.markdown} loading={noteState.loading} error={noteState.error} />
											</div>
										</div>
									</div>
								</motion.article>
							)
						})}
					</div>
				) : (
					<div className='rounded-[28px] border border-dashed border-white/80 bg-white/60 px-6 py-12 text-center text-sm text-[#84684b]'>
						{deferredKeyword.trim() ? '没有找到匹配的随笔，可以换个关键词再试。' : '还没有随笔内容，点击上方“写随笔”开始记录第一篇。'}
					</div>
				)}
			</section>
		</div>
	)
}
