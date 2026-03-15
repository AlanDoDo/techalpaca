'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, ExternalLink, Files, FolderOpenDot } from 'lucide-react'
import { ARCHIVE_PAGE_SIZE, getArchiveArticlesByCategory, getRelatedArchiveCategories, type ArchiveArticle, type ArchiveCategory } from './archive-data'
import { cn } from '@/lib/utils'

function formatDate(date: string) {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(date))
}

function ArticleLink({ article, className, children }: { article: ArchiveArticle; className?: string; children: ReactNode }) {
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

export default function ArchiveCategoryPage({ category }: { category: ArchiveCategory }) {
	const [page, setPage] = useState(1)

	const articles = useMemo(() => getArchiveArticlesByCategory(category.id), [category.id])
	const totalPages = Math.max(1, Math.ceil(articles.length / ARCHIVE_PAGE_SIZE))
	const pagedArticles = useMemo(() => {
		const start = (page - 1) * ARCHIVE_PAGE_SIZE
		return articles.slice(start, start + ARCHIVE_PAGE_SIZE)
	}, [articles, page])
	const relatedCategories = useMemo(() => getRelatedArchiveCategories(category.id), [category.id])

	useEffect(() => {
		setPage(1)
	}, [category.id])

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages)
		}
	}, [page, totalPages])

	return (
		<div className='mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pt-24 pb-16'>
			<motion.section
				initial={{ opacity: 0, y: 18 }}
				animate={{ opacity: 1, y: 0 }}
				className={cn(
					'relative overflow-hidden rounded-[32px] border border-white/80 bg-linear-to-br p-8 shadow-[0_28px_80px_-50px_rgba(0,0,0,0.38)] ring-1 backdrop-blur-md',
					category.theme.surface,
					category.theme.ring
				)}>
				<div className='absolute top-0 right-0 h-44 w-44 rounded-full bg-white/35 blur-3xl' />
				<div className='relative space-y-5'>
					<Link href='/bloggers' className='inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-[#876744] transition hover:bg-white'>
						<ArrowLeft className='h-4 w-4' />
						返回文章归档
					</Link>

					<div className='space-y-3'>
						<p className='text-secondary text-xs tracking-[0.24em] uppercase'>{category.eyebrow}</p>
						<h1 className='text-primary text-3xl font-semibold md:text-5xl'>{category.name}</h1>
						<p className='text-secondary max-w-3xl text-sm leading-7 md:text-base'>{category.description}</p>
					</div>

					<div className='flex flex-wrap gap-3'>
						<div className='rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#826447]'>
							共 <span className='text-primary font-semibold'>{articles.length}</span> 条归档内容
						</div>
						<div className='rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#826447]'>
							每页 <span className='text-primary font-semibold'>{ARCHIVE_PAGE_SIZE}</span> 条
						</div>
						<div className='rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm text-[#826447]'>
							第 <span className='text-primary font-semibold'>{page}</span> / {totalPages} 页
						</div>
					</div>
				</div>
			</motion.section>

			<section className='space-y-4'>
				<div className='flex items-end justify-between gap-4'>
					<div>
						<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Archive List</p>
						<h2 className='text-primary mt-2 text-2xl font-semibold'>按页面整理后的文章列表</h2>
					</div>
					<div className='flex items-center gap-2'>
						<button
							type='button'
							onClick={() => setPage(prev => Math.max(1, prev - 1))}
							disabled={page === 1}
							className='rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-[#7e6549] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'>
							上一页
						</button>
						<button
							type='button'
							onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
							disabled={page === totalPages}
							className='rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm text-[#7e6549] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50'>
							下一页
						</button>
					</div>
				</div>

				<div className='space-y-4'>
					{pagedArticles.map((article, index) => (
						<motion.article
							key={article.id}
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.05 }}
							className='overflow-hidden rounded-[28px] border border-white/80 bg-white/72 p-6 shadow-[0_24px_55px_-38px_rgba(0,0,0,0.35)] backdrop-blur-sm'>
							<div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
								<div className='min-w-0 flex-1'>
									<div className='flex flex-wrap items-center gap-3 text-xs text-[#8b7357]'>
										<span className='rounded-full bg-[#f8efe5] px-3 py-1'>{formatDate(article.date)}</span>
										<span>{article.source}</span>
										{article.external && (
											<span className='inline-flex items-center gap-1 rounded-full border border-[#ecdcc8] bg-[#fff8f0] px-3 py-1'>
												<ExternalLink className='h-3 w-3' />
												外部来源
											</span>
										)}
									</div>

									<h3 className='text-primary mt-4 text-2xl font-semibold'>{article.title}</h3>
									<p className='text-secondary mt-3 text-sm leading-7'>{article.excerpt}</p>

									<div className='mt-5 flex flex-wrap gap-2'>
										{article.tags.map(tag => (
											<span key={tag} className='rounded-full border border-[#efdfcf] bg-[#fffaf4] px-3 py-1 text-xs text-[#8e7456]'>
												#{tag}
											</span>
										))}
									</div>
								</div>

								<ArticleLink
									article={article}
									className='text-primary inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-[#fffaf4] px-5 py-3 text-sm font-medium transition hover:bg-white lg:min-w-[140px]'>
									打开文章
									<ArrowRight className='h-4 w-4' />
								</ArticleLink>
							</div>
						</motion.article>
					))}
				</div>
			</section>

			{totalPages > 1 && (
				<section className='flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/80 bg-white/70 px-5 py-4 shadow-[0_20px_40px_-34px_rgba(0,0,0,0.35)] backdrop-blur-sm'>
					<div className='text-secondary flex items-center gap-2 text-sm'>
						<Files className='h-4 w-4' />
						当前页 {page}，共 {totalPages} 页
					</div>
					<div className='flex items-center gap-2'>
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
					</div>
				</section>
			)}

			<section className='space-y-4'>
				<div>
					<p className='text-secondary text-xs tracking-[0.22em] uppercase'>Explore More</p>
					<h2 className='text-primary mt-2 text-2xl font-semibold'>继续浏览其他归档分类</h2>
				</div>

				<div className='grid gap-4 md:grid-cols-3'>
					{relatedCategories.map(item => (
						<Link
							key={item.id}
							href={`/bloggers/${item.id}`}
							className={cn(
								'group rounded-[28px] border border-white/80 bg-linear-to-br p-5 shadow-[0_24px_50px_-38px_rgba(0,0,0,0.35)] ring-1 backdrop-blur-sm transition duration-300 hover:-translate-y-1',
								item.theme.surface,
								item.theme.ring
							)}>
							<div className='flex items-start justify-between gap-3'>
								<div>
									<p className='text-secondary text-xs tracking-[0.18em] uppercase'>{item.eyebrow}</p>
									<h3 className='text-primary mt-2 text-xl font-semibold'>{item.name}</h3>
								</div>
								<FolderOpenDot className='h-5 w-5 text-[#8a6a47]' />
							</div>

							<p className='text-secondary mt-3 text-sm leading-7'>{item.description}</p>
							<div className='text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium'>
								{getArchiveArticlesByCategory(item.id).length} 条内容
								<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	)
}
