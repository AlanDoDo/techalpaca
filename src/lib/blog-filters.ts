import type { BlogIndexItem } from '@/app/blog/types'

export const NOTES_CATEGORY = '随笔'

export function normalizeBlogCategory(category?: string) {
	return (category || '').trim()
}

export function isNotesCategory(category?: string) {
	return normalizeBlogCategory(category) === NOTES_CATEGORY
}

export function isNoteItem(item: Pick<BlogIndexItem, 'category'>) {
	return isNotesCategory(item.category)
}

export function isRegularBlogItem(item: Pick<BlogIndexItem, 'category'>) {
	return !isNoteItem(item)
}

export function filterNoteItems<T extends Pick<BlogIndexItem, 'category'>>(items: T[]) {
	return items.filter(isNoteItem)
}

export function filterRegularBlogItems<T extends Pick<BlogIndexItem, 'category'>>(items: T[]) {
	return items.filter(isRegularBlogItem)
}
