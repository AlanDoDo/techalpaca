import { motion } from 'motion/react'
import { useRef } from 'react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWriteStore } from '../stores/write-store'
import { usePreviewStore } from '../stores/preview-store'
import { usePublish } from '../hooks/use-publish'

export function WriteActions() {
	const { loading, mode, form, originalSlug, updateForm } = useWriteStore()
	const { openPreview } = usePreviewStore()
	const { isAuth, onChoosePrivateKey, onPublish, onDelete } = usePublish()
	const keyInputRef = useRef<HTMLInputElement>(null)
	const mdInputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()
	const searchParams = useSearchParams()
	const returnTo = searchParams.get('returnTo') || ''

	const handleImportOrPublish = async () => {
		if (!isAuth) {
			keyInputRef.current?.click()
			return
		}

		const success = await onPublish()
		if (success && returnTo.startsWith('/')) {
			router.push(returnTo)
		}
	}

	const handleCancel = () => {
		if (!window.confirm('确定要放弃当前编辑内容吗？')) {
			return
		}
		if (mode === 'edit' && originalSlug) {
			router.push(`/blog/${originalSlug}`)
		} else if (returnTo.startsWith('/')) {
			router.push(returnTo)
		} else {
			router.push('/')
		}
	}

	const buttonText = isAuth ? (mode === 'edit' ? '保存修改' : '发布文章') : '导入密钥'

	const handleDelete = () => {
		if (!isAuth) {
			toast.info('请先导入密钥')
			return
		}
		const confirmMsg = form?.title ? `确定要删除《${form.title}》吗？此操作不可恢复。` : '确定要删除当前文章吗？此操作不可恢复。'
		if (window.confirm(confirmMsg)) {
			void onDelete()
		}
	}

	const handleImportMd = () => {
		mdInputRef.current?.click()
	}

	const handleMdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		try {
			const text = await file.text()
			updateForm({ md: text })
			toast.success('Markdown 已导入')
		} catch (error) {
			toast.error('导入 Markdown 失败')
		} finally {
			if (e.currentTarget) e.currentTarget.value = ''
		}
	}

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await onChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>
			<input ref={mdInputRef} type='file' accept='.md' className='hidden' onChange={handleMdFileChange} />

			<ul className='absolute top-4 right-6 flex items-center gap-2'>
				{mode === 'edit' && (
					<>
						<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='flex items-center gap-2'>
							<div className='rounded-lg border bg-blue-50 px-4 py-2 text-sm text-blue-700'>编辑模式</div>
						</motion.div>

						<motion.button
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className='rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-100'
							disabled={loading}
							onClick={handleDelete}>
							删除
						</motion.button>

						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCancel} disabled={loading} className='bg-card rounded-xl border px-4 py-2 text-sm'>
							取消
						</motion.button>
					</>
				)}

				<motion.button
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='bg-card rounded-xl border px-4 py-2 text-sm'
					disabled={loading}
					onClick={handleImportMd}>
					导入 MD
				</motion.button>
				<motion.button
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='bg-card rounded-xl border px-6 py-2 text-sm'
					disabled={loading}
					onClick={openPreview}>
					预览
				</motion.button>
				<motion.button
					initial={{ opacity: 0, scale: 0.6 }}
					animate={{ opacity: 1, scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className='brand-btn px-6'
					disabled={loading}
					onClick={() => void handleImportOrPublish()}>
					{buttonText}
				</motion.button>
			</ul>
		</>
	)
}
