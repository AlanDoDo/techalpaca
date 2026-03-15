'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import ArchiveCategoryPage from '../archive-category-page'
import { getArchiveCategory } from '../archive-data'

export default function Page() {
	const params = useParams() as { category?: string | string[] }
	const categoryId = Array.isArray(params?.category) ? params.category[0] : params?.category || ''
	const category = getArchiveCategory(categoryId)

	if (!category) {
		return (
			<div className='mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-6 text-center'>
				<div className='text-primary text-3xl font-semibold'>这个归档分类暂时还不存在</div>
				<p className='text-secondary max-w-xl text-sm leading-7'>可以先回到文章归档首页，从科技、金融、AI、前端工程或商业趋势这些已经整理好的入口继续浏览。</p>
				<Link href='/bloggers' className='rounded-full border border-white/80 bg-white/80 px-5 py-3 text-sm text-[#7b6247] transition hover:bg-white'>
					返回文章归档
				</Link>
			</div>
		)
	}

	return <ArchiveCategoryPage category={category} />
}
