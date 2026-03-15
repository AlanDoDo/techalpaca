import { useCallback } from 'react'
import { toast } from 'sonner'
import { readFileAsText } from '@/lib/file-utils'
import { useAuthStore } from '@/hooks/use-auth'
import { pushBlog } from '../services/push-blog'
import { deleteBlog } from '../services/delete-blog'
import { useWriteStore } from '../stores/write-store'

export function usePublish() {
	const { loading, setLoading, form, cover, images, mode, originalSlug } = useWriteStore()
	const { isAuth, setPrivateKey } = useAuthStore()

	const onChoosePrivateKey = useCallback(
		async (file: File) => {
			const pem = await readFileAsText(file)
			setPrivateKey(pem)
		},
		[setPrivateKey]
	)

	const onPublish = useCallback(async () => {
		try {
			setLoading(true)
			await pushBlog({
				form,
				cover,
				images,
				mode,
				originalSlug
			})

			toast.success(mode === 'edit' ? '文章已保存' : '文章已发布')
			return true
		} catch (err: any) {
			console.error(err)
			toast.error(err?.message || '发布失败')
			return false
		} finally {
			setLoading(false)
		}
	}, [form, cover, images, mode, originalSlug, setLoading])

	const onDelete = useCallback(async () => {
		const targetSlug = originalSlug || form.slug
		if (!targetSlug) {
			toast.error('缺少文章 slug')
			return
		}
		try {
			setLoading(true)
			await deleteBlog(targetSlug)
		} catch (err: any) {
			console.error(err)
			toast.error(err?.message || '删除失败')
		} finally {
			setLoading(false)
		}
	}, [form.slug, originalSlug, setLoading])

	return {
		isAuth,
		loading,
		onChoosePrivateKey,
		onPublish,
		onDelete
	}
}
