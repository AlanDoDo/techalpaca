'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, BookOpenText, CalendarDays, FolderKanban, Search, Sparkles } from 'lucide-react'
import { archiveCategories, getArchiveStats, searchArchive, type ArchiveArticle } from './archive-data'
import { cn } from '@/lib/utils'

function formatDate(date: string) {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(date))
}

function ArchiveLink({ article, className, children }: { article: ArchiveArticle; className?: string; children: ReactNode }) {
	if (article.external) {
		return (
			<a href={article.href} target='_blank' rel='noreferrer' className={className}>
				{children}
			</a>
		)
	}

	return (
		<Link href={article.href} className={className}>
			{children}
		</Link>
	)
}

export default function ArchiveHome() {
	const [keyword, setKeyword] = useState('')
	const deferredKeyword = useDeferredValue(keyword)
	const stats = useMemo(() => getArchiveStats(), [])

	const { categories, articles } = useMemo(() => searchArchive(deferredKeyword), [deferredKeyword])
	const featuredArticles = useMemo(() => articles.slice(0, 6), [articles])
	const hasKeyword = deferredKeyword.trim().length > 0

	return (
		<div className='mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pt-24 pb-16'>
			<motion.section
				initial={{ opacity: 0, y: 18 }}
				animate={{ opacity: 1, y: 0 }}
				className='relative overflow-hidden rounded-[32px] border border-white/70 bg-[radial-gradient(circle_at_top_left,_rgba(255,214,163,0.45),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.9),_rgba(255,248,240,0.78))] p-8 shadow-[0_28px_80px_-50px_rgba(86,54,17,0.4)] backdrop-blur-md'>
				<div className='absolute top-0 right-0 h-48 w-48 rounded-full bg-[#ffd6b5]/40 blur-3xl' />
				<div className='absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#f6e5bf]/45 blur-3xl' />

				<div className='relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px]'>
					<div className='space-y-5'>
						<div className='inline-flex items-center gap-2 rounded-full border border-[#f1d7b1] bg-white/70 px-4 py-1.5 text-xs tracking-[0.24em] text-[#9f6f35] uppercase'>
							<Sparkles className='h-3.5 w-3.5' />
							文章归档
						</div>

						<div className='space-y-3'>
							<h1 className='text-primary text-3xl font-semibold tracking-[0.04em] md:text-5xl'>把优秀内容整理成可持续扩展的阅读入口</h1>
							<p className='text-secondary max-w-2xl text-sm leading-7 md:text-base'>
								这里不再是“优秀博客”列表，而是一套按主题组织的文章归档页面。现在先整理科技、金融、AI、前端工程和商业趋势，后续继续扩展新专题时只需要补充数据源即可。
							</p>
						</div>

						<label className='relative block max-w-2xl'>
							<Search className='text-secondary absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
							<input
								type='text'
								placeholder='搜索关键词'
								value={keyword}
								onChange={event => setKeyword(event.target.value)}
								className='focus:ring-brand/40 w-full rounded-2xl border border-white/80 bg-white/85 py-4 pr-4 pl-11 text-sm shadow-[0_12px_30px_-25px_rgba(0,0,0,0.45)] outline-none ring-0 transition focus:ring-4'
							/>
						</label>

						<div className='flex flex-wrap gap-2'>
							{archiveCategories.map(category => (
								<span key={category.id} className='rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs text-[#8c6845]'>
									{category.name}
								</span>
							))}
						</div>
					</div>

					<div className='grid gap-4 sm:grid-cols-3 lg:grid-cols-1'>
						<div className='rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.45)]'>
							<div className='text-secondary flex items-center gap-2 text-xs tracking-[0.24em] uppercase'>
								<FolderKanban className='h-3.5 w-3.5' />
								专题数
							</div>
							<div className='text-primary mt-4 text-4xl font-semibold'>{stats.categoryCount}</div>
							<p className='text-secondary mt-2 text-sm'>首页会优先展示所有主题入口，后续新增分类也能直接接入。</p>
						</div>

						<div className='rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.45)]'>
							<div className='text-secondary flex items-center gap-2 text-xs tracking-[0.24em] uppercase'>
								<BookOpenText className='h-3.5 w-3.5' />
								归档条目
							</div>
							<div className='text-primary mt-4 text-4xl font-semibold'>{stats.articleCount}</div>
							<p className='text-secondary mt-2 text-sm'>分类页默认每页展示 5 条，适合继续向里扩充文章资料。</p>
						</div>

						<div className='rounded-[24px] border border-white/70 bg-white/70 p-5 shadow-[0_20px_45px_-35px_rgba(0,0,0,0.45)]'>
							<div className='text-secondary flex items-center gap-2 text-xs tracking-[0.24em] uppercase'>
								<CalendarDays className='h-3.5 w-3.5' />
								最近整理
							</div>
							<div className='text-primary mt-4 text-2xl font-semibold'>{stats.latestUpdatedAt ? formatDate(stats.latestUpdatedAt) : '--'}</div>
							<p className='text-secondary mt-2 text-sm'>搜索结果会同时匹配分类名、标题、摘要、来源和标签。</p>
						</div>
					</div>
				</div>
			</motion.section>

			<section className='space-y-4'>
				<div className='flex items-end justify-between gap-4'>
					<div>
						<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Archive Topics</p>
						<h2 className='text-primary mt-2 text-2xl font-semibold'>{hasKeyword ? '匹配到的归档专题' : '可浏览的归档专题'}</h2>
					</div>
					<div className='text-secondary text-sm'>{hasKeyword ? `关键词 “${deferredKeyword.trim()}”` : '支持后续继续扩展'}</div>
				</div>

				<div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
					{categories.map((category, index) => {
						const count = articles.filter(article => article.categoryId === category.id).length

						return (
							<motion.div
								key={category.id}
								initial={{ opacity: 0, y: 18 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.05 }}
								className={cn(
									'group overflow-hidden rounded-[28px] border border-white/80 bg-linear-to-br p-6 shadow-[0_24px_50px_-38px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1',
									category.theme.surface,
									category.theme.ring
								)}>
								<div className='flex items-start justify-between gap-4'>
									<div>
										<p className='text-secondary text-xs tracking-[0.22em] uppercase'>{category.eyebrow}</p>
										<h3 className='text-primary mt-2 text-2xl font-semibold'>{category.name}</h3>
									</div>
									<div className={cn('h-3 w-3 rounded-full shadow-[0_0_0_8px_rgba(255,255,255,0.55)]', category.theme.accent)} />
								</div>

								<p className='text-secondary mt-4 text-sm leading-7'>{category.description}</p>

								<div className='mt-5 flex flex-wrap gap-2'>
									{category.keywords.map(tag => (
										<span key={tag} className='rounded-full border border-white/80 bg-white/75 px-3 py-1 text-xs text-[#7a6650]'>
											{tag}
										</span>
									))}
								</div>

								<div className='mt-8 flex items-center justify-between'>
									<div className='text-secondary text-sm'>
										<span className='text-primary font-semibold'>{count}</span> 条匹配内容
									</div>
									<Link
										href={`/bloggers/${category.id}`}
										className='text-primary inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-medium transition hover:bg-white'>
										查看分类
										<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
									</Link>
								</div>
							</motion.div>
						)
					})}
				</div>

				{categories.length === 0 && (
					<div className='rounded-[28px] border border-dashed border-white/80 bg-white/60 px-6 py-10 text-center text-sm text-[#81684d]'>
						没有找到匹配的专题，可以换个关键词再试试。
					</div>
				)}
			</section>

			<section className='space-y-4'>
				<div className='flex items-end justify-between gap-4'>
					<div>
						<p className='text-secondary text-xs tracking-[0.22em] uppercase'>{hasKeyword ? 'Matched Articles' : 'Latest Picks'}</p>
						<h2 className='text-primary mt-2 text-2xl font-semibold'>{hasKeyword ? '关键词结果预览' : '最近整理的归档内容'}</h2>
					</div>
					<div className='text-secondary text-sm'>{featuredArticles.length} 条展示中</div>
				</div>

				<div className='grid gap-4 lg:grid-cols-2'>
					{featuredArticles.map((article, index) => {
						const category = archiveCategories.find(item => item.id === article.categoryId)

						return (
							<motion.div key={article.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }}>
								<ArchiveLink
									article={article}
									className='group block rounded-[28px] border border-white/80 bg-white/72 p-6 shadow-[0_24px_50px_-38px_rgba(0,0,0,0.35)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/85'>
									<div className='flex flex-wrap items-center gap-3 text-xs text-[#8a7357]'>
										<span className='rounded-full bg-[#f7efe6] px-3 py-1'>{category?.name || '归档'}</span>
										<span>{article.source}</span>
										<span>{formatDate(article.date)}</span>
									</div>

									<h3 className='text-primary mt-4 text-xl font-semibold transition group-hover:text-[#c16424]'>{article.title}</h3>
									<p className='text-secondary mt-3 line-clamp-3 text-sm leading-7'>{article.excerpt}</p>

									<div className='mt-5 flex flex-wrap gap-2'>
										{article.tags.map(tag => (
											<span key={tag} className='rounded-full border border-[#f0e5d7] bg-[#fffaf4] px-3 py-1 text-xs text-[#8f7456]'>
												#{tag}
											</span>
										))}
									</div>

									<div className='text-primary mt-6 inline-flex items-center gap-2 text-sm font-medium'>
										阅读全文
										<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
									</div>
								</ArchiveLink>
							</motion.div>
						)
					})}
				</div>

				{featuredArticles.length === 0 && (
					<div className='rounded-[28px] border border-dashed border-white/80 bg-white/60 px-6 py-10 text-center text-sm text-[#81684d]'>
						当前关键词还没有匹配到文章结果，可以尝试“科技”“金融”“AI”“前端”等词。
					</div>
				)}
			</section>
		</div>
	)
}
