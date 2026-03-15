import { motion } from 'motion/react'
import { useWriteStore } from '../../stores/write-store'
import { TagInput } from '../ui/tag-input'
import { useCategories } from '@/hooks/use-categories'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { Select } from '@/components/select'

type MetaSectionProps = {
	delay?: number
}

export function MetaSection({ delay = 0 }: MetaSectionProps) {
	const { form, updateForm } = useWriteStore()
	const { categories } = useCategories()
	const { siteContent } = useConfigStore()
	const enableCategories = siteContent.enableCategories ?? false

	const mergedCategories = form.category && !categories.includes(form.category) ? [form.category, ...categories] : categories
	const categoryOptions = [{ value: '', label: '未分类' }, ...mergedCategories.map(cat => ({ value: cat, label: cat }))]

	return (
		<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay }} className='card relative'>
			<h2 className='text-sm'>文章信息</h2>

			<div className='mt-3 space-y-2'>
				<textarea
					placeholder='写一句摘要，帮助自己和读者快速理解这篇内容。'
					rows={2}
					className='bg-card block w-full resize-none rounded-xl border p-3 text-sm'
					value={form.summary}
					onChange={e => updateForm({ summary: e.target.value })}
				/>

				<TagInput tags={form.tags} onChange={tags => updateForm({ tags })} />
				{enableCategories && <Select className='w-full text-sm' value={form.category || ''} onChange={value => updateForm({ category: value })} options={categoryOptions} />}
				<input
					type='datetime-local'
					placeholder='发布时间'
					className='bg-card w-full rounded-lg border px-3 py-2 text-sm'
					value={form.date}
					onChange={e => updateForm({ date: e.target.value })}
				/>

				<div className='flex items-center gap-2'>
					<input
						type='checkbox'
						id='hidden-check'
						checked={form.hidden || false}
						onChange={e => updateForm({ hidden: e.target.checked })}
						className='h-4 w-4 rounded border-gray-300'
					/>
					<label htmlFor='hidden-check' className='cursor-pointer text-sm text-gray-600 select-none'>
						隐藏文章，不在公开列表中显示
					</label>
				</div>
			</div>
		</motion.div>
	)
}
