'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import HomeOutlineSVG from '@/svgs/home-outline.svg'
import { useSize } from '@/hooks/use-size'
import { cn } from '@/lib/utils'

type HomeButtonProps = {
	className?: string
}

export function HomeButton({ className }: HomeButtonProps) {
	const pathname = usePathname()
	const { init } = useSize()

	if (!init || pathname === '/' || pathname.startsWith('/write')) return null

	return (
		<motion.div initial={{ opacity: 0, scale: 0.5, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.24 }}>
			<Link
				href='/'
				aria-label='返回主页'
				className={cn(
					'card text-secondary hover:text-brand fixed bottom-8 left-6 z-50 inline-flex rounded-full p-3 transition-colors',
					'max-sm:bottom-8 max-sm:left-4',
					className
				)}>
				<HomeOutlineSVG className='h-6 w-6' />
			</Link>
		</motion.div>
	)
}
