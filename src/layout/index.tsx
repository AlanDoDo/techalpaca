'use client'
import { PropsWithChildren } from 'react'
import dynamic from 'next/dynamic'
import { useCenterInit } from '@/hooks/use-center'
import { Toaster } from 'sonner'
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'
import { useSize, useSizeInit } from '@/hooks/use-size'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { HomeButton } from '@/components/home-button'
import { useDeferredMount } from '@/hooks/use-deferred-mount'

const BlurredBubblesBackground = dynamic(() => import('./backgrounds/blurred-bubbles'), { ssr: false })
const NavCard = dynamic(() => import('@/components/nav-card'))
const MusicCard = dynamic(() => import('@/components/music-card'))
const ScrollTopButton = dynamic(() => import('@/components/scroll-top-button').then(module => ({ default: module.ScrollTopButton })), {
	ssr: false
})

export default function Layout({ children }: PropsWithChildren) {
	useCenterInit()
	useSizeInit()
	const { cardStyles, siteContent, regenerateKey } = useConfigStore()
	const { maxSM, init } = useSize()
	const shouldMountEnhancements = useDeferredMount(350)
	const shouldMountBackground = useDeferredMount(550)

	const backgroundImages = (siteContent.backgroundImages ?? []) as Array<{ id: string; url: string }>
	const currentBackgroundImageId = siteContent.currentBackgroundImageId
	const currentBackgroundImage =
		currentBackgroundImageId && currentBackgroundImageId.trim() ? backgroundImages.find(item => item.id === currentBackgroundImageId) : null

	return (
		<>
			<Toaster
				position='bottom-right'
				richColors
				icons={{
					success: <CircleCheckIcon className='size-4' />,
					info: <InfoIcon className='size-4' />,
					warning: <TriangleAlertIcon className='size-4' />,
					error: <OctagonXIcon className='size-4' />,
					loading: <Loader2Icon className='size-4 animate-spin' />
				}}
				style={
					{
						'--border-radius': '12px'
					} as React.CSSProperties
				}
			/>
			{currentBackgroundImage && (
				<div
					className='fixed inset-0 z-0 overflow-hidden'
					style={{
						backgroundImage: `url(${currentBackgroundImage.url})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						backgroundRepeat: 'no-repeat'
					}}
				/>
			)}
			{shouldMountBackground && <BlurredBubblesBackground colors={siteContent.backgroundColors} regenerateKey={regenerateKey} />}

			<main className='relative z-10 h-full'>
				{children}
				{shouldMountEnhancements && <NavCard />}
				<HomeButton />

				{shouldMountEnhancements && !maxSM && cardStyles.musicCard?.enabled !== false && <MusicCard />}
			</main>

			{shouldMountEnhancements && maxSM && init && <ScrollTopButton className='bg-brand/20 fixed right-6 bottom-8 z-50 shadow-md' />}
		</>
	)
}
