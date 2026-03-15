'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { DialogModal } from '@/components/dialog-modal'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '../stores/config-store'
import { pushSiteContent } from '../services/push-site-content'
import type { CardStyles, SiteContent } from '../stores/config-store'
import { SiteSettings, type ArtImageUploads, type BackgroundImageUploads, type FileItem, type SocialButtonImageUploads } from './site-settings'
import { ColorConfig } from './color-config'
import { HomeLayout } from './home-layout'

interface ConfigDialogProps {
	open: boolean
	onClose: () => void
}

type TabType = 'site' | 'color' | 'layout'

export default function ConfigDialog({ open, onClose }: ConfigDialogProps) {
	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent, setSiteContent, cardStyles, setCardStyles, regenerateBubbles } = useConfigStore()
	const [formData, setFormData] = useState<SiteContent>(siteContent)
	const [cardStylesData, setCardStylesData] = useState<CardStyles>(cardStyles)
	const [originalData, setOriginalData] = useState<SiteContent>(siteContent)
	const [originalCardStyles, setOriginalCardStyles] = useState<CardStyles>(cardStyles)
	const [isSaving, setIsSaving] = useState(false)
	const [activeTab, setActiveTab] = useState<TabType>('site')
	const keyInputRef = useRef<HTMLInputElement>(null)
	const [faviconItem, setFaviconItem] = useState<FileItem | null>(null)
	const [avatarItem, setAvatarItem] = useState<FileItem | null>(null)
	const [artImageUploads, setArtImageUploads] = useState<ArtImageUploads>({})
	const [backgroundImageUploads, setBackgroundImageUploads] = useState<BackgroundImageUploads>({})
	const [socialButtonImageUploads, setSocialButtonImageUploads] = useState<SocialButtonImageUploads>({})

	useEffect(() => {
		if (!open) return

		const currentSiteContent = { ...useConfigStore.getState().siteContent }
		const currentCardStyles = { ...useConfigStore.getState().cardStyles }

		setFormData(currentSiteContent)
		setCardStylesData(currentCardStyles)
		setOriginalData(currentSiteContent)
		setOriginalCardStyles(currentCardStyles)
		setFaviconItem(null)
		setAvatarItem(null)
		setArtImageUploads({})
		setBackgroundImageUploads({})
		setSocialButtonImageUploads({})
		setActiveTab('site')
	}, [open])

	useEffect(() => {
		return () => {
			if (faviconItem?.type === 'file') {
				URL.revokeObjectURL(faviconItem.previewUrl)
			}
			if (avatarItem?.type === 'file') {
				URL.revokeObjectURL(avatarItem.previewUrl)
			}
			Object.values(artImageUploads).forEach(item => {
				if (item.type === 'file') {
					URL.revokeObjectURL(item.previewUrl)
				}
			})
			Object.values(backgroundImageUploads).forEach(item => {
				if (item.type === 'file') {
					URL.revokeObjectURL(item.previewUrl)
				}
			})
			Object.values(socialButtonImageUploads).forEach(item => {
				if (item.type === 'file') {
					URL.revokeObjectURL(item.previewUrl)
				}
			})
		}
	}, [faviconItem, avatarItem, artImageUploads, backgroundImageUploads, socialButtonImageUploads])

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取私钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
			return
		}

		handleSave()
	}

	const handleSave = async () => {
		setIsSaving(true)
		try {
			const originalArtImages = originalData.artImages ?? []
			const currentArtImages = formData.artImages ?? []
			const removedArtImages = originalArtImages.filter(orig => !currentArtImages.some(current => current.id === orig.id))

			const originalBackgroundImages = originalData.backgroundImages ?? []
			const currentBackgroundImages = formData.backgroundImages ?? []
			const removedBackgroundImages = originalBackgroundImages.filter(orig => !currentBackgroundImages.some(current => current.id === orig.id))

			await pushSiteContent(
				formData,
				cardStylesData,
				faviconItem,
				avatarItem,
				artImageUploads,
				removedArtImages,
				backgroundImageUploads,
				removedBackgroundImages,
				socialButtonImageUploads
			)

			setSiteContent(formData)
			setCardStyles(cardStylesData)
			updateThemeVariables(formData.theme)
			setFaviconItem(null)
			setAvatarItem(null)
			setArtImageUploads({})
			setBackgroundImageUploads({})
			setSocialButtonImageUploads({})
			onClose()
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		if (faviconItem?.type === 'file') {
			URL.revokeObjectURL(faviconItem.previewUrl)
		}
		if (avatarItem?.type === 'file') {
			URL.revokeObjectURL(avatarItem.previewUrl)
		}
		Object.values(artImageUploads).forEach(item => {
			if (item.type === 'file') {
				URL.revokeObjectURL(item.previewUrl)
			}
		})
		Object.values(backgroundImageUploads).forEach(item => {
			if (item.type === 'file') {
				URL.revokeObjectURL(item.previewUrl)
			}
		})
		Object.values(socialButtonImageUploads).forEach(item => {
			if (item.type === 'file') {
				URL.revokeObjectURL(item.previewUrl)
			}
		})

		setSiteContent(originalData)
		setCardStyles(originalCardStyles)
		regenerateBubbles()

		if (typeof document !== 'undefined') {
			document.title = originalData.meta.title
			const metaDescription = document.querySelector('meta[name="description"]')
			if (metaDescription) {
				metaDescription.setAttribute('content', originalData.meta.description)
			}
		}

		updateThemeVariables(originalData.theme)
		setFaviconItem(null)
		setAvatarItem(null)
		setArtImageUploads({})
		setBackgroundImageUploads({})
		setSocialButtonImageUploads({})
		onClose()
	}

	const updateThemeVariables = (theme?: SiteContent['theme']) => {
		if (typeof document === 'undefined' || !theme) return

		const { colorArticle, colorBg, colorBorder, colorBrand, colorBrandSecondary, colorCard, colorPrimary, colorSecondary } = theme
		const root = document.documentElement

		if (colorBrand) root.style.setProperty('--color-brand', colorBrand)
		if (colorBrandSecondary) root.style.setProperty('--color-brand-secondary', colorBrandSecondary)
		if (colorPrimary) root.style.setProperty('--color-primary', colorPrimary)
		if (colorSecondary) root.style.setProperty('--color-secondary', colorSecondary)
		if (colorBg) root.style.setProperty('--color-bg', colorBg)
		if (colorBorder) root.style.setProperty('--color-border', colorBorder)
		if (colorCard) root.style.setProperty('--color-card', colorCard)
		if (colorArticle) root.style.setProperty('--color-article', colorArticle)
	}

	const handlePreview = () => {
		setSiteContent(formData)
		setCardStyles(cardStylesData)
		regenerateBubbles()

		if (typeof document !== 'undefined') {
			document.title = formData.meta.title
			const metaDescription = document.querySelector('meta[name="description"]')
			if (metaDescription) {
				metaDescription.setAttribute('content', formData.meta.description)
			}
		}

		updateThemeVariables(formData.theme)
		onClose()
	}

	const buttonText = isAuth ? '保存' : '导入私钥后保存'

	const tabs: { id: TabType; label: string }[] = [
		{ id: 'site', label: '站点设置' },
		{ id: 'color', label: '颜色配置' },
		{ id: 'layout', label: '首页布局' }
	]

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

			<DialogModal open={open} onClose={handleCancel} className='card scrollbar-none max-h-[90vh] min-h-[600px] w-[720px] max-w-[calc(100vw-2rem)] overflow-y-auto'>
				<div className='mb-6 flex items-start justify-between gap-4'>
					<div className='scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pr-2'>
						{tabs.map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`relative shrink-0 whitespace-nowrap px-3 py-2 text-sm leading-none font-medium transition-colors ${
									activeTab === tab.id ? 'text-brand' : 'text-secondary hover:text-primary'
								}`}>
								{tab.label}
								{activeTab === tab.id && <div className='bg-brand absolute right-0 bottom-0 left-0 h-0.5' />}
							</button>
						))}
					</div>

					<div className='flex shrink-0 gap-3'>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePreview} className='bg-card rounded-xl border px-6 py-2 text-sm'>
							预览
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='bg-card rounded-xl border px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSaveClick} disabled={isSaving} className='brand-btn px-6'>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</div>
				</div>

				<div className='min-h-[200px]'>
					{activeTab === 'site' && (
						<SiteSettings
							formData={formData}
							setFormData={setFormData}
							faviconItem={faviconItem}
							setFaviconItem={setFaviconItem}
							avatarItem={avatarItem}
							setAvatarItem={setAvatarItem}
							artImageUploads={artImageUploads}
							setArtImageUploads={setArtImageUploads}
							backgroundImageUploads={backgroundImageUploads}
							setBackgroundImageUploads={setBackgroundImageUploads}
							socialButtonImageUploads={socialButtonImageUploads}
							setSocialButtonImageUploads={setSocialButtonImageUploads}
						/>
					)}
					{activeTab === 'color' && <ColorConfig formData={formData} setFormData={setFormData} />}
					{activeTab === 'layout' && <HomeLayout cardStylesData={cardStylesData} setCardStylesData={setCardStylesData} onClose={onClose} />}
				</div>
			</DialogModal>
		</>
	)
}
