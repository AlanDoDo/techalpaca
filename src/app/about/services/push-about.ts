import { toast } from 'sonner'
import { getAuthToken } from '@/lib/auth'
import { GITHUB_CONFIG } from '@/consts'
import { createBlob, createCommit, createTree, getRef, toBase64Utf8, type TreeItem, updateRef } from '@/lib/github-client'

export type BookRecommendation = {
	id: string
	title: string
	author: string
	note: string
}

export type BookCategory = {
	id: string
	name: string
	description: string
	books: BookRecommendation[]
}

export type AboutData = {
	title: string
	description: string
	content: string
	bookCategories: BookCategory[]
}

export async function pushAbout(data: AboutData): Promise<void> {
	const token = await getAuthToken()

	toast.info('正在连接 GitHub 仓库...')
	const refData = await getRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`)
	const latestCommitSha = refData.sha

	const treeItems: TreeItem[] = []
	const aboutJson = JSON.stringify(data, null, '\t')
	const aboutBlob = await createBlob(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, toBase64Utf8(aboutJson), 'base64')

	treeItems.push({
		path: 'src/app/about/list.json',
		mode: '100644',
		type: 'blob',
		sha: aboutBlob.sha
	})

	toast.info('正在生成提交内容...')
	const treeData = await createTree(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, treeItems, latestCommitSha)
	const commitData = await createCommit(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, 'Update about page content', treeData.sha, [latestCommitSha])

	toast.info('正在推送更新...')
	await updateRef(token, GITHUB_CONFIG.OWNER, GITHUB_CONFIG.REPO, `heads/${GITHUB_CONFIG.BRANCH}`, commitData.sha)

	toast.success('关于页面内容已保存')
}
