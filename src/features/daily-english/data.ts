export interface DailyEnglishEntry {
	id: string
	english: string
	translation: string
	scenario: string
	reflection: string
	pronunciation: string
	tags: string[]
}

export const DAILY_ENGLISH_ENTRIES: DailyEnglishEntry[] = [
	{
		id: 'small-steps-count',
		english: 'Small steps still count as progress.',
		translation: '再小的步子，也算在前进。',
		scenario: '适合在项目推进慢、学习进度不快时，用来鼓励自己或朋友。',
		reflection: '很多焦虑不是因为没努力，而是只盯着终点。先承认一点点推进，也是在给长期主义续航。',
		pronunciation: 'small steps still count as progress',
		tags: ['鼓励', '成长', '日常口语']
	},
	{
		id: 'give-me-second',
		english: 'Give me a second, I am still thinking.',
		translation: '等我一下，我还在想。',
		scenario: '开会、聊天、面试时，需要一点时间组织语言。',
		reflection: '很多人一着急就乱答。会先争取一点点思考时间，本身就是成熟表达的一部分。',
		pronunciation: 'give me a second, I am still thinking',
		tags: ['沟通', '职场', '思考']
	},
	{
		id: 'lets-keep-simple',
		english: "Let's keep it simple and make it work first.",
		translation: '我们先把事情做简单，先让它跑起来。',
		scenario: '讨论方案时，先收敛复杂度，避免过度设计。',
		reflection: '先跑通再打磨，往往比一开始就追求完美更接近真实世界的节奏。',
		pronunciation: "let's keep it simple and make it work first",
		tags: ['产品', '开发', '协作']
	},
	{
		id: 'thats-fair-point',
		english: "That's a fair point, and I should think about it more.",
		translation: '这个观点很有道理，我需要再想一想。',
		scenario: '别人提出合理反驳时，用来表达开放和尊重。',
		reflection: '真正强的人不是句句都要赢，而是能在对的时候停下来，允许自己被修正。',
		pronunciation: "that's a fair point, and I should think about it more",
		tags: ['讨论', '尊重', '表达']
	},
	{
		id: 'not-end-world',
		english: "It's not the end of the world. We can fix it.",
		translation: '事情没那么糟，我们能修好它。',
		scenario: '线上出错、进度延误、情绪紧绷时安抚团队。',
		reflection: '稳定军心有时比技术动作更重要。先把人稳住，问题才更容易被解决。',
		pronunciation: "it's not the end of the world. we can fix it",
		tags: ['安抚', '团队', '问题处理']
	},
	{
		id: 'circle-back-later',
		english: "Let's circle back to this later.",
		translation: '这件事我们晚点再回来讨论。',
		scenario: '话题跑偏、信息不足或当前优先级不够时使用。',
		reflection: '会暂停一个议题，不代表逃避，而是把注意力留给更重要的事。',
		pronunciation: "let's circle back to this later",
		tags: ['会议', '职场', '节奏']
	},
	{
		id: 'need-clearer-plan',
		english: 'We need a clearer plan before we move faster.',
		translation: '在加速之前，我们需要一个更清晰的计划。',
		scenario: '团队想快推，但方向还乱的时候。',
		reflection: '很多“快”最后会变成返工。真正的效率，常常来自先把方向讲清楚。',
		pronunciation: 'we need a clearer plan before we move faster',
		tags: ['计划', '团队', '效率']
	},
	{
		id: 'take-your-time',
		english: 'Take your time. There is no rush.',
		translation: '慢慢来，不着急。',
		scenario: '安慰紧张的人，或提醒自己不要被外界节奏裹挟。',
		reflection: '不是所有事情都值得冲刺。有些成长，本来就需要一点缓慢和沉淀。',
		pronunciation: 'take your time. there is no rush',
		tags: ['安慰', '节奏', '心理']
	},
	{
		id: 'i-am-working-on-it',
		english: 'I am working on it, and I will keep you posted.',
		translation: '我正在处理，有进展我会及时同步。',
		scenario: '回复同事、客户或朋友，给对方明确预期。',
		reflection: '可靠感很多时候不是来自速度，而是来自持续反馈。',
		pronunciation: 'i am working on it, and i will keep you posted',
		tags: ['同步', '职场', '信任']
	},
	{
		id: 'better-question',
		english: 'Maybe we are asking the wrong question.',
		translation: '也许我们一开始就问错问题了。',
		scenario: '问题越讨论越乱时，提醒大家回到本质。',
		reflection: '很多卡住的时刻，不是答案难，而是问题本身就偏了。',
		pronunciation: 'maybe we are asking the wrong question',
		tags: ['思辨', '问题', '团队']
	},
	{
		id: 'good-enough-today',
		english: 'Good enough for today is better than perfect someday.',
		translation: '今天先做到足够好，比某天再完美更重要。',
		scenario: '对抗拖延、完美主义和迟迟不敢发布。',
		reflection: '发布不是结束，而是进入真实反馈的开始。过度打磨常常只是温柔的拖延。',
		pronunciation: 'good enough for today is better than perfect someday',
		tags: ['行动', '完美主义', '执行']
	},
	{
		id: 'lets-break-down',
		english: "Let's break it down into smaller pieces.",
		translation: '我们把它拆成更小的部分。',
		scenario: '任务太大、信息太杂时，先拆解再推进。',
		reflection: '越复杂的事情，越需要小颗粒度地处理。拆解，本身就是解决问题的一半。',
		pronunciation: "let's break it down into smaller pieces",
		tags: ['拆解', '任务', '方法']
	},
	{
		id: 'i-missed-that',
		english: 'I missed that detail. Thanks for catching it.',
		translation: '这个细节我漏掉了，谢谢你提醒。',
		scenario: '承认遗漏，并且积极回应别人的补充。',
		reflection: '认错并不会削弱专业性，反而会让合作变得更可信。',
		pronunciation: 'i missed that detail. thanks for catching it',
		tags: ['反馈', '协作', '谦逊']
	},
	{
		id: 'sounds-like-plan',
		english: 'That sounds like a solid plan to me.',
		translation: '听起来这是个很稳的方案。',
		scenario: '认同方案、推进协作时使用。',
		reflection: '在团队里，明确表达支持很重要。它能让一个模糊的想法更快落地。',
		pronunciation: 'that sounds like a solid plan to me',
		tags: ['认可', '团队', '推进']
	},
	{
		id: 'need-fresh-eyes',
		english: 'I think we need a fresh pair of eyes on this.',
		translation: '我觉得这件事需要新的视角来看看。',
		scenario: '自己卡住太久，想邀请别人一起排查或复盘。',
		reflection: '当我们陷在局部细节里，外部视角常常就是最便宜的解法。',
		pronunciation: 'i think we need a fresh pair of eyes on this',
		tags: ['协作', '排查', '复盘']
	},
	{
		id: 'one-thing-time',
		english: 'One thing at a time, and we will get there.',
		translation: '一件一件来，我们会到达的。',
		scenario: '待办过载、心态发散时拉回专注。',
		reflection: '专注不是做得少，而是知道此刻什么最值得先做。',
		pronunciation: 'one thing at a time, and we will get there',
		tags: ['专注', '节奏', '成长']
	},
	{
		id: 'i-see-what-you-mean',
		english: 'I see what you mean, even if I am not fully there yet.',
		translation: '我理解你的意思了，虽然我还没完全想透。',
		scenario: '表达“我听懂了，但我还需要消化一下”。',
		reflection: '理解和认同不一定同步。先确认理解，能让对话继续往前走。',
		pronunciation: 'i see what you mean, even if i am not fully there yet',
		tags: ['对话', '理解', '表达']
	},
	{
		id: 'lets-sleep-on-it',
		english: "Let's sleep on it and decide tomorrow.",
		translation: '我们先放一晚，明天再决定。',
		scenario: '面对重要决策但情绪或信息还不稳定时。',
		reflection: '不是所有决定都该在最焦虑的那个时刻做出。睡一觉，有时就是最好的优化器。',
		pronunciation: "let's sleep on it and decide tomorrow",
		tags: ['决策', '冷静', '节奏']
	},
	{
		id: 'appreciate-patience',
		english: 'I appreciate your patience while I figure this out.',
		translation: '在我把这件事理清之前，谢谢你的耐心。',
		scenario: '对方在等待你的结果、回复或修复进展时。',
		reflection: '及时表达感谢，能把“被动等待”变成“被尊重地等待”。',
		pronunciation: 'i appreciate your patience while i figure this out',
		tags: ['感谢', '沟通', '关系']
	},
	{
		id: 'start-with-version-one',
		english: 'We can start with version one and improve from there.',
		translation: '我们可以先做第一版，再在此基础上继续优化。',
		scenario: '项目初期、需求多变时，用来强调迭代思维。',
		reflection: '把自己从“一次做到位”的压力里解放出来，迭代才真正能发生。',
		pronunciation: 'we can start with version one and improve from there',
		tags: ['迭代', '产品', '执行']
	}
]

