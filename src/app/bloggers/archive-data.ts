export type ArchiveCategoryId = 'technology' | 'finance' | 'ai' | 'frontend' | 'business'

export type ArchiveCategory = {
	id: ArchiveCategoryId
	name: string
	description: string
	eyebrow: string
	keywords: string[]
	theme: {
		surface: string
		ring: string
		accent: string
	}
}

export type ArchiveArticle = {
	id: string
	title: string
	excerpt: string
	date: string
	href: string
	source: string
	tags: string[]
	categoryId: ArchiveCategoryId
	external?: boolean
}

export const ARCHIVE_PAGE_SIZE = 5

export const archiveCategories: ArchiveCategory[] = [
	{
		id: 'technology',
		name: '科技',
		description: '收录前端工程、独立开发、产品技术拆解等内容，适合持续跟进技术趋势。',
		eyebrow: 'Technology',
		keywords: ['前端', '工程化', '独立开发', '技术趋势'],
		theme: {
			surface: 'from-[#fff4e8] via-white to-[#ffe3bd]',
			ring: 'ring-[#f4b16b]/35',
			accent: 'bg-[#e57d1f]'
		}
	},
	{
		id: 'finance',
		name: '金融',
		description: '围绕宏观、市场、资产配置与企业财报整理阅读入口，方便后续继续扩展专题。',
		eyebrow: 'Finance',
		keywords: ['宏观', '财报', '市场', '资产配置'],
		theme: {
			surface: 'from-[#eef8ef] via-white to-[#d7f2db]',
			ring: 'ring-[#5ea66f]/35',
			accent: 'bg-[#3f8f52]'
		}
	},
	{
		id: 'ai',
		name: 'AI',
		description: '聚合模型、Agent 工作流、AI 产品设计与应用观察，适合追踪新能力落地。',
		eyebrow: 'AI & Agents',
		keywords: ['LLM', 'Agent', '模型', '应用'],
		theme: {
			surface: 'from-[#edf4ff] via-white to-[#dae8ff]',
			ring: 'ring-[#6a97e8]/35',
			accent: 'bg-[#4f75d6]'
		}
	},
	{
		id: 'frontend',
		name: '前端工程',
		description: '重点收录交互、组件系统、动画、性能与框架实践，适合做日常灵感仓库。',
		eyebrow: 'Frontend',
		keywords: ['React', '动画', '设计系统', '性能'],
		theme: {
			surface: 'from-[#fff3f6] via-white to-[#ffe0ea]',
			ring: 'ring-[#ef88ad]/35',
			accent: 'bg-[#da5f8e]'
		}
	},
	{
		id: 'business',
		name: '商业趋势',
		description: '补充产品、消费、产业与公司策略观察，让归档页不仅限于技术内容。',
		eyebrow: 'Business',
		keywords: ['产业', '消费', '公司策略', '增长'],
		theme: {
			surface: 'from-[#f7f2ff] via-white to-[#ebe0ff]',
			ring: 'ring-[#9b79e6]/35',
			accent: 'bg-[#7f61d2]'
		}
	}
]

export const archiveArticles: ArchiveArticle[] = [
	{
		id: 'wave-ball-shader-notes',
		title: '波动球与 Shader 动效拆解',
		excerpt: '站内现有文章，适合作为科技分类的基础样例，聚焦 Three.js 与 Shader 的视觉实验。',
		date: '2026-01-14T18:03:00',
		href: '/blog/wave-ball',
		source: 'TechAlpaca',
		tags: ['Three.js', 'Shader', '交互实验'],
		categoryId: 'technology'
	},
	{
		id: 'anthony-fu-tooling',
		title: 'Anthony Fu 的工具链与个人工作流观察',
		excerpt: '从开源工具、工程效率到个人网站设计，适合归档在持续追踪的科技阅读入口里。',
		date: '2026-02-18T09:20:00',
		href: 'https://antfu.me/',
		source: 'Anthony Fu',
		tags: ['开源', '效率', '工程'],
		categoryId: 'technology',
		external: true
	},
	{
		id: 'emil-motion-systems',
		title: 'Emil Kowalski 的交互动效笔记',
		excerpt: '更偏产品和界面实现，适合放在科技归档中做交互表达的灵感来源。',
		date: '2026-02-10T12:00:00',
		href: 'https://emilkowal.ski/',
		source: 'Emil Kowalski',
		tags: ['动效', '交互', '产品设计'],
		categoryId: 'technology',
		external: true
	},
	{
		id: 'huozhi-engineering-notes',
		title: 'Huozhi 的基础设施与前端工程复盘',
		excerpt: '更偏工程深度，适合放在科技分类里作为“做事方法”与“架构意识”的参考。',
		date: '2026-01-28T08:40:00',
		href: 'https://huozhi.im/',
		source: 'Huozhi',
		tags: ['架构', '前端工程', '基础设施'],
		categoryId: 'technology',
		external: true
	},
	{
		id: 'enji-personal-site',
		title: 'Enji Kusnadi 的个人站结构灵感',
		excerpt: '既有设计表达，也有个人品牌站点信息组织方式，适合放进科技归档。',
		date: '2026-01-12T10:15:00',
		href: 'https://enji.dev/',
		source: 'Enji Kusnadi',
		tags: ['个人站', '品牌设计', '内容组织'],
		categoryId: 'technology',
		external: true
	},
	{
		id: 'risingle-content-brand',
		title: 'Risingle 的内容品牌与独立站表达',
		excerpt: '从视觉统一性到内容风格，能补充科技分类里“技术之外的表达能力”。',
		date: '2025-12-20T21:10:00',
		href: 'https://www.imrising.cn/',
		source: 'Risingle',
		tags: ['独立站', '视觉', '内容品牌'],
		categoryId: 'technology',
		external: true
	},
	{
		id: 'caixin-macro-watch',
		title: '宏观政策与流动性观察',
		excerpt: '适合作为金融页面的长期栏目，关注政策变化、利率环境和市场风险偏好的切换。',
		date: '2026-02-22T08:00:00',
		href: 'https://www.caixin.com/',
		source: '财新',
		tags: ['宏观', '政策', '流动性'],
		categoryId: 'finance',
		external: true
	},
	{
		id: 'wallstreetcn-market-open',
		title: '市场情绪与科技股估值节奏',
		excerpt: '偏交易感知和市场热度追踪，方便后续持续补充到金融页面中。',
		date: '2026-02-17T07:45:00',
		href: 'https://wallstreetcn.com/',
		source: '华尔街见闻',
		tags: ['市场', '科技股', '估值'],
		categoryId: 'finance',
		external: true
	},
	{
		id: 'ftchinese-company-results',
		title: '企业财报中的增长与现金流信号',
		excerpt: '更偏企业经营与全球化视角，适合和市场类内容一起构成金融页面的第二层阅读。',
		date: '2026-02-08T18:35:00',
		href: 'https://www.ftchinese.com/',
		source: 'FT 中文网',
		tags: ['财报', '增长', '公司分析'],
		categoryId: 'finance',
		external: true
	},
	{
		id: 'macromicro-allocation',
		title: '资产配置与周期切换观察',
		excerpt: '作为金融归档的工具型条目，适合后续扩展更多周期、资产与指标的关联阅读。',
		date: '2026-01-30T09:00:00',
		href: 'https://sc.macromicro.me/',
		source: 'MacroMicro',
		tags: ['资产配置', '周期', '指标'],
		categoryId: 'finance',
		external: true
	},
	{
		id: 'longbridge-investing-journal',
		title: '投资笔记里的仓位与风险控制',
		excerpt: '把“怎么想”和“怎么做”分开记录，适合作为金融分类里偏实操的阅读入口。',
		date: '2026-01-16T20:10:00',
		href: 'https://longbridge.com/hk',
		source: 'Longbridge',
		tags: ['投资', '仓位', '风险控制'],
		categoryId: 'finance',
		external: true
	},
	{
		id: 'jiemian-industry-tracking',
		title: '产业链与消费赛道的季度跟踪',
		excerpt: '把行业景气度和公司变化放在一起看，适合补充金融页面中的产业观察维度。',
		date: '2025-12-28T11:30:00',
		href: 'https://www.jiemian.com/',
		source: '界面新闻',
		tags: ['产业', '消费', '跟踪'],
		categoryId: 'finance',
		external: true
	},
	{
		id: 'openai-product-notes',
		title: 'OpenAI 产品迭代与 Agent 工作流观察',
		excerpt: '适合作为 AI 分类的入口条目，关注模型能力如何转化为实际产品体验。',
		date: '2026-03-01T10:20:00',
		href: 'https://openai.com/',
		source: 'OpenAI',
		tags: ['Agent', '产品', '模型能力'],
		categoryId: 'ai',
		external: true
	},
	{
		id: 'huggingface-model-ecosystem',
		title: 'Hugging Face 模型生态与社区热点',
		excerpt: '适合持续追踪开源模型、数据集和应用范式，是 AI 分类里很好的底层资料源。',
		date: '2026-02-25T14:00:00',
		href: 'https://huggingface.co/',
		source: 'Hugging Face',
		tags: ['开源模型', '数据集', '社区'],
		categoryId: 'ai',
		external: true
	},
	{
		id: 'simon-llm-engineering',
		title: 'LLM Engineering 的提示词与工具调用实践',
		excerpt: '更偏工程实现，适合补足 AI 分类中“从概念到落地”的阅读路径。',
		date: '2026-02-11T13:20:00',
		href: 'https://simonwillison.net/',
		source: 'Simon Willison',
		tags: ['LLM', '工具调用', '工程实践'],
		categoryId: 'ai',
		external: true
	},
	{
		id: 'latent-space-ai-briefing',
		title: 'AI 产品节奏与创业趋势速记',
		excerpt: '关注行业变化速度和创业者动作，适合作为 AI 分类里的趋势栏目。',
		date: '2026-01-22T09:50:00',
		href: 'https://www.latent.space/',
		source: 'Latent Space',
		tags: ['创业', 'AI 产品', '趋势'],
		categoryId: 'ai',
		external: true
	},
	{
		id: 'jiqizhixin-ai-apps',
		title: 'AI 应用层产品与场景化落地观察',
		excerpt: '更接近中文语境下的行业应用，方便把模型能力和实际业务场景对应起来。',
		date: '2026-01-09T19:10:00',
		href: 'https://www.jiqizhixin.com/',
		source: '机器之心',
		tags: ['应用', '中文社区', '行业案例'],
		categoryId: 'ai',
		external: true
	},
	{
		id: 'react-performance-notes',
		title: 'React 新能力与编译期优化观察',
		excerpt: '前端工程页面中的基础条目，适合串起性能、状态管理和团队代码组织。',
		date: '2026-02-20T16:20:00',
		href: 'https://react.dev/blog',
		source: 'React',
		tags: ['React', '性能', '编译优化'],
		categoryId: 'frontend',
		external: true
	},
	{
		id: 'cassie-svg-motion',
		title: 'Cassie Evans 的 SVG 与动效实验室',
		excerpt: '适合作为前端工程归档中的灵感型条目，用来补充更具表现力的界面设计方向。',
		date: '2026-02-05T11:10:00',
		href: 'https://www.cassie.codes/',
		source: 'Cassie Evans',
		tags: ['SVG', '动画', '灵感'],
		categoryId: 'frontend',
		external: true
	},
	{
		id: 'motion-layout-practice',
		title: 'Motion 布局动画与可感知反馈设计',
		excerpt: '把动效作为信息层次的一部分，而不是装饰，适合沉淀到前端工程页面中。',
		date: '2026-01-27T15:45:00',
		href: 'https://motion.dev/',
		source: 'Motion',
		tags: ['布局动画', '反馈', '交互'],
		categoryId: 'frontend',
		external: true
	},
	{
		id: 'vercel-frontend-patterns',
		title: 'Vercel 的界面性能与交付模式',
		excerpt: '更适合做工程模式观察，帮助后续归档更多偏生产环境实践的内容。',
		date: '2026-01-12T08:35:00',
		href: 'https://vercel.com/blog',
		source: 'Vercel',
		tags: ['部署', '性能', '交付'],
		categoryId: 'frontend',
		external: true
	},
	{
		id: 'imsyy-homepage-layout',
		title: '个人主页的信息密度与视觉节奏',
		excerpt: '适合作为前端工程页里的页面表达案例，补充组件系统之外的“页面编排”参考。',
		date: '2025-12-23T22:05:00',
		href: 'https://blog.imsyy.top/',
		source: '無名',
		tags: ['首页布局', '视觉节奏', '个人主页'],
		categoryId: 'frontend',
		external: true
	},
	{
		id: 'latepost-company-shift',
		title: '公司策略变化与产品方向判断',
		excerpt: '商业趋势页的基础条目，适合追踪企业如何在不确定环境里重新分配资源。',
		date: '2026-02-21T09:15:00',
		href: 'https://www.latepost.com/',
		source: '晚点 LatePost',
		tags: ['公司策略', '产品方向', '组织变化'],
		categoryId: 'business',
		external: true
	},
	{
		id: 'kr-consumer-signals',
		title: '消费品牌增长信号与渠道变化',
		excerpt: '适合作为商业趋势页中的消费观察栏目，后续可以继续补充行业案例。',
		date: '2026-02-09T10:30:00',
		href: 'https://www.36kr.com/',
		source: '36Kr',
		tags: ['消费', '增长', '渠道'],
		categoryId: 'business',
		external: true
	},
	{
		id: 'geekpark-product-trend',
		title: '产品新范式与技术落地节奏',
		excerpt: '连接科技与商业的一类内容，适合帮助归档页形成跨主题的阅读路径。',
		date: '2026-01-31T18:10:00',
		href: 'https://www.geekpark.net/',
		source: '极客公园',
		tags: ['产品', '趋势', '技术落地'],
		categoryId: 'business',
		external: true
	},
	{
		id: 'theverge-platform-news',
		title: '平台公司动作与硬件生态变化',
		excerpt: '更适合放在商业趋势页里看大公司策略、平台生态和消费终端之间的联动。',
		date: '2026-01-11T07:55:00',
		href: 'https://www.theverge.com/',
		source: 'The Verge',
		tags: ['平台', '硬件', '生态'],
		categoryId: 'business',
		external: true
	},
	{
		id: 'fastcompany-brand-experience',
		title: '品牌体验与产品叙事的组合方式',
		excerpt: '补充商业趋势页中偏品牌和用户感知的内容，让页面结构更完整。',
		date: '2025-12-18T20:20:00',
		href: 'https://www.fastcompany.com/',
		source: 'Fast Company',
		tags: ['品牌', '体验', '叙事'],
		categoryId: 'business',
		external: true
	}
]

const categoryMap = new Map(archiveCategories.map(category => [category.id, category]))

function sortByDateDesc<T extends { date: string }>(items: T[]) {
	return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function normalizeKeyword(keyword: string) {
	return keyword.trim().toLowerCase()
}

export function getArchiveCategory(categoryId: string) {
	return categoryMap.get(categoryId as ArchiveCategoryId)
}

export function getArchiveArticlesByCategory(categoryId: ArchiveCategoryId) {
	return sortByDateDesc(archiveArticles.filter(article => article.categoryId === categoryId))
}

export function getRelatedArchiveCategories(categoryId: ArchiveCategoryId) {
	return archiveCategories.filter(category => category.id !== categoryId).slice(0, 3)
}

export function getArchiveStats() {
	return {
		categoryCount: archiveCategories.length,
		articleCount: archiveArticles.length,
		latestUpdatedAt: sortByDateDesc(archiveArticles)[0]?.date
	}
}

export function searchArchive(keyword: string) {
	const normalizedKeyword = normalizeKeyword(keyword)

	if (!normalizedKeyword) {
		return {
			categories: archiveCategories,
			articles: sortByDateDesc(archiveArticles)
		}
	}

	const articles = sortByDateDesc(
		archiveArticles.filter(article => {
			const category = categoryMap.get(article.categoryId)
			const searchableValues = [article.title, article.excerpt, article.source, ...article.tags, category?.name || '', category?.description || '']
			return searchableValues.some(value => value.toLowerCase().includes(normalizedKeyword))
		})
	)

	const matchedCategoryIds = new Set(articles.map(article => article.categoryId))

	const categories = archiveCategories.filter(category => {
		const categoryMatches = [category.name, category.description, category.eyebrow, ...category.keywords].some(value => value.toLowerCase().includes(normalizedKeyword))
		return categoryMatches || matchedCategoryIds.has(category.id)
	})

	return { categories, articles }
}
