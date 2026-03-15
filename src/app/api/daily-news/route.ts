import { DAILY_NEWS_REVALIDATE_SECONDS, getDailyNews } from '@/lib/daily-news'

export const revalidate = 7200

export async function GET() {
	try {
		const data = await getDailyNews()
		return Response.json(data, {
			headers: {
				'Cache-Control': `s-maxage=${DAILY_NEWS_REVALIDATE_SECONDS}, stale-while-revalidate=600`
			}
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to load daily news'
		return Response.json(
			{
				message
			},
			{
				status: 500
			}
		)
	}
}
