'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import HiCard from '@/app/(home)/hi-card'
import ArtCard from '@/app/(home)/art-card'
import DailyEnglishCard from '@/app/(home)/clock-card'
import DailyNewsCard from '@/app/(home)/daily-news-card'
import SocialButtons from '@/app/(home)/social-buttons'
import ShareCard from '@/app/(home)/share-card'
import AritcleCard from '@/app/(home)/aritcle-card'
import WriteButtons from '@/app/(home)/write-buttons'
import LikePosition from './like-position'
import HatCard from './hat-card'
import BeianCard from './beian-card'
import ConfigDialog from './config-dialog/index'
import { useSize } from '@/hooks/use-size'
import { useAuthStore } from '@/hooks/use-auth'
import { useLayoutEditStore } from './stores/layout-edit-store'
import { useConfigStore } from './stores/config-store'
import { pushSiteContent } from './services/push-site-content'
import SnowfallBackground from '@/layout/backgrounds/snowfall'

export default function Home() {
	const { maxSM } = useSize()
	const { cardStyles, configDialogOpen, setConfigDialogOpen, siteContent } = useConfigStore()
	const { isAuth, setPrivateKey } = useAuthStore()
	const editing = useLayoutEditStore(state => state.editing)
	const saveEditing = useLayoutEditStore(state => state.saveEditing)
	const cancelEditing = useLayoutEditStore(state => state.cancelEditing)
	const keyInputRef = useRef<HTMLInputElement>(null)
	const [isSaving, setIsSaving] = useState(false)

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			await setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取私钥文件失败')
		}
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			await pushSiteContent(siteContent, cardStyles)
			saveEditing()
			toast.success('主页卡片布局已保存，刷新后会保持最新位置。')
		} catch (error: any) {
			console.error('Failed to save home layout:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
			return
		}

		void handleSave()
	}

	const handleCancel = () => {
		cancelEditing()
		toast.info('已撤销这次拖拽布局修改。')
	}

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && (event.key === 'l' || event.key === ',')) {
				event.preventDefault()
				setConfigDialogOpen(true)
			}
		}

		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [setConfigDialogOpen])

	return (
		<>
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async event => {
					const file = event.target.files?.[0]
					if (file) await handleChoosePrivateKey(file)
					event.currentTarget.value = ''
				}}
			/>

			{siteContent.enableChristmas && <SnowfallBackground zIndex={0} count={!maxSM ? 125 : 20} />}

			{editing && (
				<div className='pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-6'>
					<div className='pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-2 shadow-lg backdrop-blur'>
						<span className='text-xs text-gray-600'>拖拽卡片边框可以调整位置，右下角手柄可以缩放大小。</span>
						<div className='flex gap-2'>
							<motion.button
								type='button'
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleCancel}
								disabled={isSaving}
								className='rounded-xl border bg-white px-3 py-1 text-xs font-medium text-gray-700'>
								取消
							</motion.button>
							<motion.button
								type='button'
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={handleSaveClick}
								disabled={isSaving}
								className='brand-btn px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60'>
								{isSaving ? '保存中...' : isAuth ? '保存布局' : '导入私钥后保存布局'}
							</motion.button>
						</div>
					</div>
				</div>
			)}

			<div className='max-sm:flex max-sm:flex-col max-sm:items-center max-sm:gap-6 max-sm:pt-28 max-sm:pb-20'>
				{cardStyles.artCard?.enabled !== false && <ArtCard />}
				{cardStyles.hiCard?.enabled !== false && <HiCard />}
				{!maxSM && cardStyles.clockCard?.enabled !== false && <DailyEnglishCard />}
				{!maxSM && cardStyles.calendarCard?.enabled !== false && <DailyNewsCard />}
				{cardStyles.socialButtons?.enabled !== false && <SocialButtons />}
				{!maxSM && cardStyles.shareCard?.enabled !== false && <ShareCard />}
				{cardStyles.articleCard?.enabled !== false && <AritcleCard />}
				{!maxSM && cardStyles.writeButtons?.enabled !== false && <WriteButtons />}
				{cardStyles.likePosition?.enabled !== false && <LikePosition />}
				{cardStyles.hatCard?.enabled !== false && <HatCard />}
				{cardStyles.beianCard?.enabled !== false && <BeianCard />}
			</div>

			{siteContent.enableChristmas && <SnowfallBackground zIndex={2} count={!maxSM ? 125 : 20} />}
			<ConfigDialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} />
		</>
	)
}
