'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { BookOpenText, Plus, Trash2 } from 'lucide-react'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'
import initialData from './list.json'
import { pushAbout, type AboutData, type BookCategory } from './services/push-about'

function createEmptyBookCategory(): BookCategory {
	return {
		id: `book-category-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		name: '',
		description: '',
		books: [
			{
				id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				title: '',
				author: '',
				note: ''
			}
		]
	}
}

export default function Page() {
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const { content, loading } = useMarkdownRender(data.content)
	const hideEditButton = siteContent.hideEditButton ?? false

	const updateBookCategory = (id: string, updates: Partial<BookCategory>) => {
		setData(prev => ({
			...prev,
			bookCategories: prev.bookCategories.map(category => (category.id === id ? { ...category, ...updates } : category))
		}))
	}

	const addBookCategory = () => {
		setData(prev => ({
			...prev,
			bookCategories: [...prev.bookCategories, createEmptyBookCategory()]
		}))
	}

	const removeBookCategory = (id: string) => {
		setData(prev => ({
			...prev,
			bookCategories: prev.bookCategories.filter(category => category.id !== id)
		}))
	}

	const addBook = (categoryId: string) => {
		setData(prev => ({
			...prev,
			bookCategories: prev.bookCategories.map(category =>
				category.id === categoryId
					? {
							...category,
							books: [
								...category.books,
								{
									id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
									title: '',
									author: '',
									note: ''
								}
							]
						}
					: category
			)
		}))
	}

	const updateBook = (categoryId: string, bookId: string, updates: { title?: string; author?: string; note?: string }) => {
		setData(prev => ({
			...prev,
			bookCategories: prev.bookCategories.map(category =>
				category.id === categoryId
					? {
							...category,
							books: category.books.map(book => (book.id === bookId ? { ...book, ...updates } : book))
						}
					: category
			)
		}))
	}

	const removeBook = (categoryId: string, bookId: string) => {
		setData(prev => ({
			...prev,
			bookCategories: prev.bookCategories.map(category =>
				category.id === categoryId
					? {
							...category,
							books: category.books.filter(book => book.id !== bookId)
						}
					: category
			)
		}))
	}

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			void handleSave()
		}
	}

	const handleEnterEditMode = () => {
		setIsEditMode(true)
		setIsPreviewMode(false)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushAbout(data)
			setOriginalData(data)
			setIsEditMode(false)
			setIsPreviewMode(false)
			toast.success('关于页面已保存')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setData(originalData)
		setIsEditMode(false)
		setIsPreviewMode(false)
	}

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
				setIsPreviewMode(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	const renderBooksCard = () => (
		<motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className='card relative overflow-hidden p-6'>
			<div className='mb-6 flex items-start justify-between gap-4'>
				<div>
					<div className='text-secondary flex items-center gap-2 text-xs tracking-[0.2em] uppercase'>
						<BookOpenText className='h-4 w-4' />
						Book Shelf
					</div>
					<h2 className='text-primary mt-3 text-2xl font-semibold'>图书推荐</h2>
					<p className='text-secondary mt-2 text-sm'>整理一些会反复回看的书，先从金融、科技、玄学这些主题开始。</p>
				</div>

				{isEditMode && !isPreviewMode && (
					<motion.button
						type='button'
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={addBookCategory}
						className='inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-sm'>
						<Plus className='h-4 w-4' />
						添加分类
					</motion.button>
				)}
			</div>

			<div className='grid gap-5 lg:grid-cols-3'>
				{data.bookCategories.map(category => (
					<div key={category.id} className='rounded-[24px] border border-white/80 bg-white/60 p-5 shadow-[0_20px_40px_-36px_rgba(0,0,0,0.3)]'>
						{isEditMode && !isPreviewMode ? (
							<div className='space-y-3'>
								<div className='flex items-center gap-2'>
									<input
										type='text'
										value={category.name}
										placeholder='分类名称'
										onChange={e => updateBookCategory(category.id, { name: e.target.value })}
										className='bg-card min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm'
									/>
									<button
										type='button'
										onClick={() => removeBookCategory(category.id)}
										className='rounded-xl border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100'>
										<Trash2 className='h-4 w-4' />
									</button>
								</div>

								<textarea
									value={category.description}
									placeholder='分类说明'
									onChange={e => updateBookCategory(category.id, { description: e.target.value })}
									rows={2}
									className='bg-card w-full resize-none rounded-xl border px-3 py-2 text-sm'
								/>

								<div>
									<div className={`space-y-3 overflow-y-auto pr-1 ${category.books.length > 3 ? 'max-h-[540px]' : ''}`}>
										{category.books.map(book => (
										<div key={book.id} className='rounded-2xl border border-white/80 bg-white/70 p-3'>
											<div className='flex items-center justify-between gap-2'>
												<div className='text-primary text-sm font-medium'>书目</div>
												<button
													type='button'
													onClick={() => removeBook(category.id, book.id)}
													className='rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100'>
													<Trash2 className='h-3.5 w-3.5' />
												</button>
											</div>
											<div className='mt-2 space-y-2'>
												<input
													type='text'
													value={book.title}
													placeholder='书名'
													onChange={e => updateBook(category.id, book.id, { title: e.target.value })}
													className='bg-card w-full rounded-xl border px-3 py-2 text-sm'
												/>
												<input
													type='text'
													value={book.author}
													placeholder='作者'
													onChange={e => updateBook(category.id, book.id, { author: e.target.value })}
													className='bg-card w-full rounded-xl border px-3 py-2 text-sm'
												/>
												<textarea
													value={book.note}
													placeholder='推荐理由'
													rows={3}
													onChange={e => updateBook(category.id, book.id, { note: e.target.value })}
													className='bg-card w-full resize-none rounded-xl border px-3 py-2 text-sm'
												/>
											</div>
										</div>
										))}
									</div>
									{category.books.length > 3 && <p className='text-secondary mt-3 text-xs'>超过 3 本书时，可在卡片内滚动查看其余书目。</p>}
								</div>

								<button
									type='button'
									onClick={() => addBook(category.id)}
									className='inline-flex items-center gap-2 rounded-full border bg-white/70 px-4 py-2 text-sm'>
									<Plus className='h-4 w-4' />
									添加书目
								</button>
							</div>
						) : (
							<div>
								<div className='text-primary text-xl font-semibold'>{category.name}</div>
								<p className='text-secondary mt-2 text-sm leading-7'>{category.description}</p>

								<div>
									<div className={`mt-4 space-y-3 overflow-y-auto pr-1 ${category.books.length > 3 ? 'max-h-[420px]' : ''}`}>
										{category.books.map(book => (
										<div key={book.id} className='rounded-2xl border border-white/70 bg-white/72 p-4'>
											<div className='text-primary text-sm font-semibold'>{book.title}</div>
											<div className='text-secondary mt-1 text-xs'>{book.author}</div>
											<p className='text-secondary mt-3 text-sm leading-7'>{book.note}</p>
										</div>
										))}
									</div>
									{category.books.length > 3 && <p className='text-secondary mt-3 text-xs'>向下滚动卡片可查看更多图书推荐。</p>}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</motion.div>
	)

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12 max-sm:px-0'>
				<div className='w-full max-w-[980px] space-y-8'>
					{isEditMode ? (
						isPreviewMode ? (
							<div className='space-y-8'>
								<div className='text-center'>
									<h1 className='mb-4 text-4xl font-bold'>{data.title || '关于页面预览'}</h1>
									<p className='text-secondary text-lg'>{data.description || '这里会显示页面描述'}</p>
								</div>

								{loading ? (
									<div className='text-secondary text-center'>预览内容加载中...</div>
								) : (
									<div className='card relative p-6'>
										<div className='prose prose-sm max-w-none'>{content}</div>
									</div>
								)}

								{renderBooksCard()}
							</div>
						) : (
							<div className='space-y-8'>
								<div className='space-y-4'>
									<input
										type='text'
										placeholder='页面标题'
										className='w-full px-4 py-3 text-center text-2xl font-bold'
										value={data.title}
										onChange={e => setData({ ...data, title: e.target.value })}
									/>
									<input
										type='text'
										placeholder='页面描述'
										className='w-full px-4 py-3 text-center text-lg'
										value={data.description}
										onChange={e => setData({ ...data, description: e.target.value })}
									/>
								</div>

								<div className='card relative'>
									<textarea
										placeholder='关于我的 Markdown 内容'
										className='min-h-[400px] w-full resize-none text-sm'
										value={data.content}
										onChange={e => setData({ ...data, content: e.target.value })}
									/>
								</div>

								{renderBooksCard()}
							</div>
						)
					) : (
						<>
							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-4 text-center'>
								<h1 className='mb-4 text-4xl font-bold'>{data.title}</h1>
								<p className='text-secondary text-lg'>{data.description}</p>
							</motion.div>

							{loading ? (
								<div className='text-secondary text-center'>内容加载中...</div>
							) : (
								<motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className='card relative p-6'>
									<div className='prose prose-sm max-w-none'>{content}</div>
								</motion.div>
							)}

							{renderBooksCard()}
						</>
					)}

					<div className='mt-8 flex items-center justify-center gap-6'>
						<motion.a
							href='https://github.com/YYsuni/2025-blog-public'
							target='_blank'
							rel='noreferrer'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0 }}
							className='bg-card flex h-[53px] w-[53px] items-center justify-center rounded-full border'>
							<GithubSVG />
						</motion.a>

						<LikeButton slug='open-source' delay={0} />
					</div>
				</div>
			</div>

			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='fixed top-4 right-6 z-10 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					<>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} disabled={isSaving} className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsPreviewMode(prev => !prev)}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							{isPreviewMode ? '返回编辑' : '预览'}
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : isAuth ? '保存' : '导入密钥'}
						</motion.button>
					</>
				) : (
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleEnterEditMode}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
							编辑
						</motion.button>
					)
				)}
			</motion.div>
		</>
	)
}
