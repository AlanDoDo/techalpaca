'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useWriteStore } from './stores/write-store'
import { usePreviewStore } from './stores/preview-store'
import { WriteEditor } from './components/editor'
import { WriteSidebar } from './components/sidebar'
import { WriteActions } from './components/actions'
import { WritePreview } from './components/preview'

function WritePageContent() {
	const { form, cover, reset, updateForm } = useWriteStore()
	const searchParams = useSearchParams()
	const presetCategory = searchParams.get('category')?.trim() || ''
	const { isPreview, closePreview } = usePreviewStore()

	useEffect(() => {
		reset()
		if (presetCategory) {
			updateForm({ category: presetCategory })
		}
	}, [reset, updateForm, presetCategory])

	const coverPreviewUrl = cover ? (cover.type === 'url' ? cover.url : cover.previewUrl) : null

	return isPreview ? (
		<WritePreview form={form} coverPreviewUrl={coverPreviewUrl} onClose={closePreview} />
	) : (
		<>
			<div className='flex h-full justify-center gap-6 px-6 pt-24 pb-12'>
				<WriteEditor />
				<WriteSidebar />
			</div>

			<WriteActions />
		</>
	)
}

export default function WritePage() {
	return (
		<Suspense fallback={<div className='text-secondary flex h-full items-center justify-center text-sm'>正在加载写作页面...</div>}>
			<WritePageContent />
		</Suspense>
	)
}
