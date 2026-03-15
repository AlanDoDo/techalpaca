import { DAILY_ENGLISH_REVALIDATE_SECONDS, getDailyEnglish } from '@/lib/daily-english'

export const revalidate = 21600

export async function GET() {
	try {
		const data = await getDailyEnglish()
		return Response.json(data, {
			headers: {
				'Cache-Control': `s-maxage=${DAILY_ENGLISH_REVALIDATE_SECONDS}, stale-while-revalidate=600`
			}
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load daily English'
		return Response.json(
			{ message },
			{
				status: 500
			}
		)
	}
}
