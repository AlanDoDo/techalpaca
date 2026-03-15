'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '../app/(home)/stores/config-store'
import { CARD_SPACING } from '@/consts'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { Pause } from 'lucide-react'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

type MusicTrack = {
	id?: string
	name: string
	url: string
}

const FALLBACK_TRACKS: MusicTrack[] = [{ id: 'close-to-you', name: 'Close To You', url: '/music/close-to-you.mp3' }]

export default function MusicCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const dailyNewsCardStyles = cardStyles.calendarCard

	const tracks = useMemo(() => {
		const customTracks = siteContent.musicTracks?.filter(track => track?.url?.trim()) || []
		if (customTracks.length === 0) {
			return FALLBACK_TRACKS
		}

		return customTracks.map(track => ({
			id: track.id,
			name: track.name?.trim() || '未命名音乐',
			url: track.url.trim()
		}))
	}, [siteContent.musicTracks])

	const [isPlaying, setIsPlaying] = useState(false)
	const [currentIndex, setCurrentIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const currentIndexRef = useRef(0)
	const isPlayingRef = useRef(false)

	const isHomePage = pathname === '/'

	const position = useMemo(() => {
		if (!isHomePage) {
			return {
				x: center.width - styles.width - 16,
				y: center.height - styles.height - 16
			}
		}

		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + dailyNewsCardStyles.height + CARD_SPACING
		}
	}, [isHomePage, center, styles, hiCardStyles, clockCardStyles, dailyNewsCardStyles])

	const { x, y } = position

	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio()
		}

		const audio = audioRef.current

		const updateProgress = () => {
			if (audio.duration) {
				setProgress((audio.currentTime / audio.duration) * 100)
			}
		}

		const handleEnded = () => {
			const nextIndex = (currentIndexRef.current + 1) % tracks.length
			currentIndexRef.current = nextIndex
			setCurrentIndex(nextIndex)
			setProgress(0)
		}

		const handleTimeUpdate = () => {
			updateProgress()
		}

		const handleLoadedMetadata = () => {
			updateProgress()
		}

		audio.addEventListener('timeupdate', handleTimeUpdate)
		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('loadedmetadata', handleLoadedMetadata)

		return () => {
			audio.removeEventListener('timeupdate', handleTimeUpdate)
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
		}
	}, [tracks.length])

	useEffect(() => {
		if (currentIndex >= tracks.length) {
			setCurrentIndex(0)
			currentIndexRef.current = 0
		}
	}, [tracks, currentIndex])

	useEffect(() => {
		currentIndexRef.current = currentIndex
		if (audioRef.current) {
			const shouldContinuePlayback = isPlayingRef.current
			audioRef.current.pause()
			audioRef.current.src = tracks[currentIndex]?.url || ''
			audioRef.current.loop = false
			setProgress(0)

			if (shouldContinuePlayback) {
				audioRef.current.play().catch(console.error)
			}
		}
	}, [currentIndex, tracks])

	useEffect(() => {
		if (!audioRef.current) return
		isPlayingRef.current = isPlaying

		if (isPlaying) {
			audioRef.current.play().catch(console.error)
		} else {
			audioRef.current.pause()
		}
	}, [isPlaying])

	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.src = ''
			}
		}
	}, [])

	const togglePlayPause = () => {
		setIsPlaying(prev => !prev)
	}

	if (!isHomePage && !isPlaying) {
		return null
	}

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className={clsx('flex items-center gap-3', !isHomePage && 'fixed')}>
				{siteContent.enableChristmas && (
					<>
						<img
							src='/images/christmas/snow-10.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 120, left: -8, top: -12, opacity: 0.8 }}
						/>
						<img
							src='/images/christmas/snow-11.webp'
							alt='Christmas decoration'
							className='pointer-events-none absolute'
							style={{ width: 80, right: -10, top: -12, opacity: 0.8 }}
						/>
					</>
				)}

				<MusicSVG className='h-8 w-8' />

				<div className='flex-1'>
					<div className='text-secondary text-sm'>{tracks[currentIndex]?.name || '未命名音乐'}</div>

					<div className='mt-1 h-2 rounded-full bg-white/60'>
						<div className='bg-linear h-full rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
					</div>
				</div>

				<button onClick={togglePlayPause} className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80'>
					{isPlaying ? <Pause className='text-brand h-4 w-4' /> : <PlaySVG className='text-brand ml-1 h-4 w-4' />}
				</button>
			</Card>
		</HomeDraggableLayer>
	)
}
