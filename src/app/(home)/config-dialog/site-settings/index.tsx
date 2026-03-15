'use client'

import type { SiteContent } from '../../stores/config-store'
import type { ArtImageUploads, BackgroundImageUploads, FileItem, SocialButtonImageUploads } from './types'
import { FaviconAvatarUpload } from './favicon-avatar-upload'
import { SiteMetaForm } from './site-meta-form'
import { ArtImagesSection } from './art-images-section'
import { BackgroundImagesSection } from './background-images-section'
import { SocialButtonsSection } from './social-buttons-section'
import { HatSection } from './hat-section'
import { BeianForm } from './beian-form'

export type { FileItem, ArtImageUploads, BackgroundImageUploads, SocialButtonImageUploads } from './types'

interface SiteSettingsProps {
	formData: SiteContent
	setFormData: React.Dispatch<React.SetStateAction<SiteContent>>
	faviconItem: FileItem | null
	setFaviconItem: React.Dispatch<React.SetStateAction<FileItem | null>>
	avatarItem: FileItem | null
	setAvatarItem: React.Dispatch<React.SetStateAction<FileItem | null>>
	artImageUploads: ArtImageUploads
	setArtImageUploads: React.Dispatch<React.SetStateAction<ArtImageUploads>>
	backgroundImageUploads: BackgroundImageUploads
	setBackgroundImageUploads: React.Dispatch<React.SetStateAction<BackgroundImageUploads>>
	socialButtonImageUploads: SocialButtonImageUploads
	setSocialButtonImageUploads: React.Dispatch<React.SetStateAction<SocialButtonImageUploads>>
}

export function SiteSettings({
	formData,
	setFormData,
	faviconItem,
	setFaviconItem,
	avatarItem,
	setAvatarItem,
	artImageUploads,
	setArtImageUploads,
	backgroundImageUploads,
	setBackgroundImageUploads,
	socialButtonImageUploads,
	setSocialButtonImageUploads
}: SiteSettingsProps) {
	const musicTracks = formData.musicTracks || []

	const handleAddTrack = () => {
		setFormData(prev => ({
			...prev,
			musicTracks: [
				...(prev.musicTracks || []),
				{
					id: `track-${Date.now()}`,
					name: '',
					url: ''
				}
			]
		}))
	}

	const handleUpdateTrack = (id: string, updates: { name?: string; url?: string }) => {
		setFormData(prev => ({
			...prev,
			musicTracks: (prev.musicTracks || []).map(track => (track.id === id ? { ...track, ...updates } : track))
		}))
	}

	const handleRemoveTrack = (id: string) => {
		setFormData(prev => ({
			...prev,
			musicTracks: (prev.musicTracks || []).filter(track => track.id !== id)
		}))
	}

	return (
		<div className='space-y-6'>
			<FaviconAvatarUpload faviconItem={faviconItem} setFaviconItem={setFaviconItem} avatarItem={avatarItem} setAvatarItem={setAvatarItem} />

			<SiteMetaForm formData={formData} setFormData={setFormData} />

			<BeianForm formData={formData} setFormData={setFormData} />

			<SocialButtonsSection
				formData={formData}
				setFormData={setFormData}
				socialButtonImageUploads={socialButtonImageUploads}
				setSocialButtonImageUploads={setSocialButtonImageUploads}
			/>

			<div>
				<div className='mb-2 flex items-center justify-between'>
					<label className='block text-sm font-medium'>音乐列表</label>
					<button type='button' onClick={handleAddTrack} className='bg-card rounded-lg border px-3 py-1 text-xs font-medium'>
						+ 添加音乐
					</button>
				</div>
				{musicTracks.length === 0 && <p className='mb-2 text-xs text-gray-500'>未配置音乐时，默认播放 /music/close-to-you.mp3。</p>}
				<div className='space-y-2'>
					{musicTracks.map(track => (
						<div key={track.id} className='flex items-center gap-2'>
							<input
								type='text'
								value={track.name || ''}
								onChange={e => handleUpdateTrack(track.id, { name: e.target.value })}
								placeholder='音乐名称（例如：Close To You）'
								className='bg-secondary/10 w-48 rounded-lg border px-3 py-1.5 text-xs'
							/>
							<input
								type='text'
								value={track.url || ''}
								onChange={e => handleUpdateTrack(track.id, { url: e.target.value })}
								placeholder='音乐 URL（支持站内路径或外链）'
								className='bg-secondary/10 flex-1 rounded-lg border px-3 py-1.5 text-xs'
							/>
							<button type='button' onClick={() => handleRemoveTrack(track.id)} className='text-xs text-red-500 hover:text-red-600'>
								删除
							</button>
						</div>
					))}
				</div>
			</div>

			<ArtImagesSection formData={formData} setFormData={setFormData} artImageUploads={artImageUploads} setArtImageUploads={setArtImageUploads} />

			<BackgroundImagesSection
				formData={formData}
				setFormData={setFormData}
				backgroundImageUploads={backgroundImageUploads}
				setBackgroundImageUploads={setBackgroundImageUploads}
			/>

			<div className='flex gap-3'>
				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={formData.clockShowSeconds ?? false}
						onChange={e => setFormData({ ...formData, clockShowSeconds: e.target.checked })}
						className='accent-brand h-4 w-4 rounded'
					/>
					<span className='text-sm font-medium'>时钟显示秒数</span>
				</label>

				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={formData.summaryInContent ?? false}
						onChange={e => setFormData({ ...formData, summaryInContent: e.target.checked })}
						className='accent-brand h-4 w-4 rounded'
					/>
					<span className='text-sm font-medium'>摘要放入内容</span>
				</label>

				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={formData.hideEditButton ?? false}
						onChange={e => setFormData({ ...formData, hideEditButton: e.target.checked })}
						className='accent-brand h-4 w-4 rounded'
					/>
					<span className='text-sm font-medium'>隐藏编辑按钮（编辑快捷键 ctrl/cmd + ,）</span>
				</label>
			</div>
			<div className='flex gap-3'>
				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={formData.isCachePem ?? false}
						onChange={e => setFormData({ ...formData, isCachePem: e.target.checked })}
						className='accent-brand h-4 w-4 rounded'
					/>
					<span className='text-sm font-medium'>缓存PEM(已加密，但存在风险)</span>
				</label>
				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={formData.enableCategories ?? false}
						onChange={e => setFormData({ ...formData, enableCategories: e.target.checked })}
						className='accent-brand h-4 w-4 rounded'
					/>
					<span className='text-sm font-medium'>启用文章分类</span>
				</label>
				<label className='flex items-center gap-2'>
					<input
						type='checkbox'
						checked={formData.enableChristmas ?? false}
						onChange={e => setFormData({ ...formData, enableChristmas: e.target.checked })}
						className='accent-brand h-4 w-4 rounded'
					/>
					<span className='text-sm font-medium'>开启圣诞节</span>
				</label>
			</div>

			<HatSection formData={formData} setFormData={setFormData} />
		</div>
	)
}
