export const NOTES_CATEGORY = '随笔'
export const NOTES_PAGE_SIZE = 6

export function isNotesCategory(category?: string) {
	return (category || '').trim() === NOTES_CATEGORY
}
