'use client'

import { useEffect } from 'react'
import { useConfigStore, type CardStyles } from '../stores/config-store'
import { useLayoutEditStore } from '../stores/layout-edit-store'
import cardStylesDefault from '@/config/card-styles-default.json'

const CARD_LABELS: Record<string, string> = {
	artCard: '艺术卡片',
	hiCard: '主人简介',
	clockCard: '每日英语',
	calendarCard: '每日新闻',
	musicCard: '音乐播放',
	socialButtons: '社交按钮',
	shareCard: '分享推荐',
	articleCard: '最新文章',
	writeButtons: '写作按钮',
	navCard: '导航卡片',
	likePosition: '点赞按钮',
	hatCard: '帽子装饰',
	beianCard: '备案信息'
}

interface HomeLayoutProps {
	cardStylesData: CardStyles
	setCardStylesData: React.Dispatch<React.SetStateAction<CardStyles>>
	onClose?: () => void
}

export function HomeLayout({ cardStylesData, setCardStylesData, onClose }: HomeLayoutProps) {
	const { setCardStyles } = useConfigStore()
	const startEditing = useLayoutEditStore(state => state.startEditing)
	const editing = useLayoutEditStore(state => state.editing)

	useEffect(() => {
		setCardStyles(cardStylesData)
	}, [cardStylesData, setCardStyles])

	const updateCardStylesData = (updater: (prev: CardStyles) => CardStyles) => {
		setCardStylesData(prev => updater(prev))
	}

	const updateCardStyleField = <K extends keyof CardStyles, F extends keyof CardStyles[K]>(key: K, field: F, value: CardStyles[K][F]) => {
		updateCardStylesData(prev => ({
			...prev,
			[key]: {
				...prev[key],
				[field]: value
			}
		}))
	}

	const handleStartManualLayout = () => {
		setCardStyles(cardStylesData)
		startEditing()
		onClose?.()
	}

	const handleReset = () => {
		setCardStylesData(cardStylesDefault as unknown as CardStyles)
	}

	return (
		<div className='overflow-x-auto'>
			<div className='flex items-center justify-between gap-4'>
				<div className='text-secondary text-sm'>可以先在这里调整卡片尺寸和偏移，修改会直接同步到首页；如果需要拖拽定位，再进入拖拽编辑。</div>
				<div className='flex shrink-0 items-center gap-2 whitespace-nowrap'>
					<button type='button' onClick={handleReset} className='bg-card rounded-xl border px-3 py-1.5 text-xs font-medium'>
						恢复默认
					</button>
					<button
						type='button'
						onClick={handleStartManualLayout}
						disabled={editing}
						className='bg-card rounded-xl border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50'>
						{editing ? '正在拖拽编辑中' : '进入拖拽编辑'}
					</button>
				</div>
			</div>

			<table className='mt-3 w-full border-collapse text-sm whitespace-nowrap'>
				<thead>
					<tr className='border-b text-xs text-gray-500'>
						<th className='px-3 py-2 text-left font-medium'>卡片</th>
						<th className='px-3 py-2 text-left font-medium'>宽度</th>
						<th className='px-3 py-2 text-left font-medium'>高度</th>
						<th className='px-3 py-2 text-left font-medium'>动画顺序</th>
						<th className='px-3 py-2 text-left font-medium'>水平偏移</th>
						<th className='px-3 py-2 text-left font-medium'>垂直偏移</th>
						<th className='px-3 py-2 text-left font-medium'>启用</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries(cardStylesData).map(([key, cardStyle]: [string, any]) => (
						<tr key={key} className='border-b last:border-0'>
							<td className='px-3 py-2 align-middle whitespace-nowrap'>{CARD_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').trim()}</td>
							<td className='px-3 py-2'>
								{cardStyle.width !== undefined ? (
									<input
										type='number'
										value={cardStyle.width}
										onChange={e => updateCardStyleField(key as keyof CardStyles, 'width', (parseInt(e.target.value) || 0) as never)}
										className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-1.5 text-xs'
									/>
								) : (
									<span className='text-xs text-gray-400'>-</span>
								)}
							</td>
							<td className='px-3 py-2'>
								{cardStyle.height !== undefined ? (
									<input
										type='number'
										value={cardStyle.height}
										onChange={e => updateCardStyleField(key as keyof CardStyles, 'height', (parseInt(e.target.value) || 0) as never)}
										className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-1.5 text-xs'
									/>
								) : (
									<span className='text-xs text-gray-400'>-</span>
								)}
							</td>
							<td className='px-3 py-2'>
								<input
									type='number'
									value={cardStyle.order}
									onChange={e => updateCardStyleField(key as keyof CardStyles, 'order', (parseInt(e.target.value) || 0) as never)}
									className='bg-secondary/10 w-full rounded-lg border px-3 py-1.5 text-xs'
								/>
							</td>
							<td className='px-3 py-2'>
								<input
									type='number'
									value={cardStyle.offsetX ?? ''}
									placeholder='null'
									onChange={e => {
										const value = e.target.value === '' ? null : parseInt(e.target.value) || 0
										updateCardStyleField(key as keyof CardStyles, 'offsetX', value as never)
									}}
									className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-1.5 text-xs'
								/>
							</td>
							<td className='px-3 py-2'>
								<input
									type='number'
									value={cardStyle.offsetY ?? ''}
									placeholder='null'
									onChange={e => {
										const value = e.target.value === '' ? null : parseInt(e.target.value) || 0
										updateCardStyleField(key as keyof CardStyles, 'offsetY', value as never)
									}}
									className='no-spinner bg-secondary/10 w-full rounded-lg border px-3 py-1.5 text-xs'
								/>
							</td>
							<td className='px-3 py-2'>
								<input
									type='checkbox'
									checked={cardStyle.enabled ?? true}
									onChange={e => updateCardStyleField(key as keyof CardStyles, 'enabled', e.target.checked as never)}
									className='accent-brand h-4 w-4 rounded border-gray-300'
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
