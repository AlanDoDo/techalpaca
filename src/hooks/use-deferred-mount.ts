'use client'

import { useEffect, useState } from 'react'

export function useDeferredMount(delayMs = 300) {
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setMounted(true)
		}, delayMs)

		return () => {
			window.clearTimeout(timer)
		}
	}, [delayMs])

	return mounted
}
