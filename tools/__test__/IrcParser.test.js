jest.mock('mongoose', () => {})

const IrcParser = require('../IrcParser')

describe('parse', () => {
	const parse = msg => IrcParser.parse(msg)
	const user = 'test_user'
	const channel = 'test_channel'
	const color = '#D2691E'
	const id = 'dddddddd-bbbb-4444-8888-cccccccccccc'
	const tmiSentTs = '1589722269521'
	const userId = '22222222'
	const roomId = '1111111'
	const prefix = ':tmi.twitch.tv'
	const prefixWithUser = `:${user}!${user}@${user}.tmi.twitch.tv`
	const message = 'тестовое сообщение'
	
	it('PING', () => {
		const msg = `PING ${prefix}`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'PING',
			channel: undefined,
			user: undefined,
		})
	})
	
	it('PONG', () => {
		const msg = `PONG ${prefix}`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'PONG',
			channel: undefined,
			user: undefined,
		})
	})
	
	it('RECONNECT', () => {
		const msg = `:tmi.twitch.tv RECONNECT`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'RECONNECT',
			channel: undefined,
			user: undefined,
		})
	})
	
	it('JOIN', () => {
		const msg = `${prefixWithUser} JOIN #${channel}`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'JOIN',
			channel,
			user,
		})
	})
	
	it('PART', () => {
		const msg = `${prefixWithUser} PART #${channel}`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'PART',
			channel,
			user,
		})
	})
	
	it('PRIVMSG', () => {
		const msg = `@badge-info=subscriber/25;badges=broadcaster/1,subscriber/3000;client-nonce=08a730f03cfd50dfc83b0f81c1628eae;color=${color};display-name=${user};emotes=;flags=0-13:;id=${id};mod=0;room-id=${roomId};subscriber=1;tmi-sent-ts=${tmiSentTs};turbo=0;user-id=${userId};user-type= ${prefixWithUser} PRIVMSG #${channel} :${message}`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'PRIVMSG',
			channel,
			user,
			params: [`#${channel}`, message],
			tags: {
				badgeInfo: 'subscriber/25',
				badges: 'broadcaster/1,subscriber/3000',
				clientNonce: '08a730f03cfd50dfc83b0f81c1628eae',
				color,
				displayName: user,
				emotes: '',
				flags: '0-13:',
				id,
				mod: false,
				roomId,
				subscriber: true,
				tmiSentTs,
				turbo: false,
				userId,
				userType: ''
			}
		})
	})
	
	describe('USERNOTICE', () => {
		const subPlanName = 'test'
		const subPlan = '1000'
		
		it('sub', () => {
			const msg = `@badge-info=;badges=;color=${color};display-name=${user};emotes=;flags=;id=${id};login=${user};mod=0;msg-id=sub;msg-param-cumulative-months=1;msg-param-months=0;msg-param-should-share-streak=0;msg-param-sub-plan-name=${subPlanName};msg-param-sub-plan=${subPlan};room-id=${roomId};subscriber=0;system-msg=${user}\ssubscribed\sat\sTier\s1.;tmi-sent-ts=${tmiSentTs};user-id=${userId};user-type= ${prefix} USERNOTICE #${channel}`
			expect(parse(msg)).toMatchObject({
				raw: msg,
				command: 'USERNOTICE',
				channel,
				user,
				tags: {
					badgeInfo: '',
					badges: '',
					color,
					displayName: user,
					emotes: '',
					flags: '',
					id,
					login: user,
					mod: false,
					msgId: 'sub',
					cumulativeMonths: '1',
					months: '0',
					shouldShareStreak: '0',
					subPlanName,
					subPlan,
					roomId,
					subscriber: false,
					systemMsg: `${user}ssubscribedsatsTiers1.`,
					tmiSentTs,
					userId,
					userType: ''
				}
			})
		})
		
		it('resub', () => {
			const msg = `@badge-info=founder/3;badges=founder/0,bits/100;color=${color};display-name=${user};emotes=;flags=;id=${id};login=${user};mod=0;msg-id=resub;msg-param-cumulative-months=3;msg-param-months=0;msg-param-should-share-streak=0;msg-param-sub-plan-name=${subPlanName};msg-param-sub-plan=${subPlan};room-id=${roomId};subscriber=1;system-msg=${user}\ssubscribed\sat\sTier\s1.\sThey've\ssubscribed\sfor\s3\smonths!;tmi-sent-ts=${tmiSentTs};user-id=${userId};user-type= ${prefix} USERNOTICE #${channel} :${message}`
			expect(parse(msg)).toMatchObject({
				raw: msg,
				command: 'USERNOTICE',
				channel,
				user,
				params: [`#${channel}`, message],
				tags: {
					badgeInfo: 'founder/3',
					badges: 'founder/0,bits/100',
					color,
					displayName: user,
					emotes: '',
					flags: '',
					id,
					login: user,
					mod: false,
					msgId: 'resub',
					cumulativeMonths: '3',
					months: '0',
					shouldShareStreak: '0',
					subPlanName,
					subPlan,
					roomId,
					subscriber: true,
					systemMsg: `${user}ssubscribedsatsTiers1.sThey'vessubscribedsfors3smonths!`,
					tmiSentTs,
					userId,
					userType: ''
				}
			})
		})
	})
	
	it('CLEARCHAT', () => {
		const msg = `@ban-duration=60;room-id=${roomId};target-user-id=${userId};tmi-sent-ts=${tmiSentTs} ${prefix} CLEARCHAT #${channel} :${user}`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'CLEARCHAT',
			channel,
			user,
			tags: {
				banDuration: '60',
				roomId,
				targetUserId: userId,
				tmiSentTs
			}
		})
	})
	
	it('CLEARMSG', () => {
		const msg = `@login=${user};room-id=;target-msg-id=${id};tmi-sent-ts=${tmiSentTs} ${prefix} CLEARMSG #${channel} :${message}`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'CLEARMSG',
			channel,
			user,
			params: [`#${channel}`, message],
			tags: {
				login: user,
				roomId: '',
				targetMsgId: id,
				tmiSentTs
			}
		})
	})
	
	it('RECONNECT', () => {
		const msg = `:tmi.twitch.tv RECONNECT`
		expect(parse(msg)).toMatchObject({
			raw: msg,
			command: 'RECONNECT',
			channel: undefined,
			user: undefined,
		})
	})
})
