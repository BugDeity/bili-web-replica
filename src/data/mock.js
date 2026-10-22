// 本地 mock 数据：用固定种子的随机数生成，刷新页面后内容保持一致

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function rngFor(key) {
  return mulberry32(typeof key === 'number' ? key : hashStr(String(key)))
}

const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
const randInt = (r, min, max) => Math.floor(r() * (max - min + 1)) + min

export const img = (seed, w, h) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`

// ---------- 格式化 ----------
export function formatCount(n) {
  if (n >= 1e8) return (n / 1e8).toFixed(1).replace(/\.0$/, '') + '亿'
  if (n >= 1e4) return (n / 1e4).toFixed(1).replace(/\.0$/, '') + '万'
  return String(n)
}

export function formatDuration(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const pad = (x) => String(x).padStart(2, '0')
  return h ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const NOW = new Date('2026-10-22T20:00:00+08:00').getTime()

export function formatPubdate(ts) {
  const diff = (NOW - ts) / 1000
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 172800) return '昨天'
  const d = new Date(ts)
  const md = `${d.getMonth() + 1}-${d.getDate()}`
  return d.getFullYear() === 2026 ? md : `${d.getFullYear()}-${md}`
}

export function formatFullDate(ts) {
  const d = new Date(ts)
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// ---------- 词库 ----------
const TITLES = [
  '【4K】第一次去新疆自驾，这里的风景美到窒息',
  '花了三个月，我用乐高复刻了整座紫禁城',
  '当你把《孤勇者》交给一支民乐团演奏',
  '【何同学】我们做了一个能自己走路的桌子',
  '全网最细！零基础一小时学会 Python 爬虫',
  '在日本便利店打工的一天，比想象中累多了',
  '挑战用 100 块钱在上海生活一周',
  '这可能是 B 站最治愈的猫猫合集了',
  '【原神】新版本全角色强度榜，抽谁不亏？',
  '大学生毕业设计：我做了一台会写书法的机械臂',
  '老爸第一次玩《黑神话：悟空》，结局绷不住了',
  '30 天减脂 10 斤的真实记录，不节食不吃药',
  '用 AI 给《西游记》重新配乐，效果出乎意料',
  '一口气看完《三体》全部剧情，太震撼了',
  '把 iPhone 拆成零件再装回去，还能开机吗？',
  '【舞蹈】极乐净土 新编版 | 生日作',
  '家常红烧肉的正确做法，肥而不腻入口即化',
  '为什么高铁上从来不用系安全带？',
  '我在深山里搭了一座木屋，用了整整一年',
  '【鬼畜】当你的室友凌晨三点还在打游戏',
  '这个物理实验，让全班同学都沉默了',
  '月薪三千和月薪三万的周末有什么区别',
  '【纪录片】深海一万米，到底有什么？',
  '国产新能源车极限续航测试，结果意外',
  '「钢琴」一个人演奏整部《千与千寻》',
  '在故宫当文物修复师是一种什么体验',
  '如何用一张纸折出一只会飞的鹤',
  '五分钟看懂量子纠缠，文科生也能听懂',
  '【翻唱】起风了｜深夜一个人在天台唱',
  '我把家里的老房子改造成了梦想工作室',
  '自制 1:1 钢铁侠战甲，真的能飞起来',
  '跟着导航走进了一条没有尽头的路',
  '《英雄联盟》S16 总决赛全场高光集锦',
  '花 5000 块组一台能打 3A 大作的电脑',
  '如果把太阳换成其他恒星，地球会怎样？',
  '外国小哥第一次吃螺蛳粉，反应太真实了',
  '凌晨四点的菜市场，才是城市真正的样子',
  '我用 Blender 做了一个赛博朋克城市',
  '【MMD】初音未来 · 千本樱 4K 60帧',
  '一个人骑行川藏线，第 18 天到达拉萨',
  '程序员的一天：从入门到放弃',
  '解压视频｜修复一把锈迹斑斑的百年老刀',
  '史上最难的数学题，到底难在哪里？',
  '我们去了全国最便宜的旅游城市',
  '高考 750 分是一种什么样的存在',
  '复刻《中华小当家》里的黄金炒饭',
  '把我奶奶的老照片修复上色后，她哭了',
  '整整 72 小时不睡觉，人会发生什么变化',
  '【明日方舟】新干员实战演示，强到离谱',
  '这首歌火了二十年，你一定听过',
  '全网首发！2026 年最值得买的手机推荐',
  '小区里的流浪猫，竟然会自己按电梯',
  '我在 B 站学会了做蛋糕，第一次就成功',
  '如何优雅地拒绝领导的不合理要求',
  '耗时 300 小时，手绘一幅清明上河图',
  '【赛博朋克2077】夜之城全景漫游',
  '花一天时间，带你逛遍整个重庆',
  '海底捞员工的真实一天，太卷了',
  '用 Excel 画画的大爷，作品惊艳全网',
  '养了一年的多肉，终于开花了',
]

const UP_NAMES = [
  '老番茄', '何同学', '影视飓风', '罗翔说刑法', '敖厂长', '中国BOY超级大猩猩', '徐大虾咯', '李子柒',
  '某幻君', '绵羊料理', '华农兄弟', '手工耿', '半佛仙人', '老师好我叫何同学', '小潮院长', 'papi酱',
  '木鱼水心', '硬核的半佛仙人', '盗月社食遇记', '凉风Kaze', '泛式', '花少北丶', '指法芬芳张大仙', '才疏学浅的才浅',
  '林亦LYi', '芳斯塔芙', '有点意思的阿伟', '极客湾Geekerwan', '小约翰可汗', '食贫道', '画画的北北', '星有野',
  '靠谱电竞', '思维实验室', '冰糖IO', '无穷小亮的科普日常', '巫师财经', '猫咪日记本', '程序员鱼皮', '我是谁的阿婆',
]

const SIGNS = [
  '生活不止眼前的苟且，还有诗和远方',
  '商务合作请私信，不定期更新',
  '一个热爱生活的普通人',
  '每周五晚八点更新，不见不散~',
  '用镜头记录世界的美好',
  '做点有意思的东西',
  '关注我，带你看更大的世界',
]

const CATEGORIES = ['生活', '知识', '游戏', '音乐', '美食', '科技', '动画', '鬼畜', '舞蹈', '影视', '运动', '汽车', '动物圈', '旅游出行']

const TAG_POOL = ['日常', 'vlog', '必剪创作', '知识分享官', '学习', '科普', '搞笑', '美食制作', '数码', '游戏杂谈', '音乐现场', '翻唱', '手工', '旅行', '治愈', '纪录片', '原创', '热门', '2026', '新星计划']

export const DANMAKU_POOL = [
  '前方高能！！！', '哈哈哈哈哈哈哈哈', '来了来了', '第一次来这么早', '下次一定', '三连了三连了', 'awsl',
  '好家伙', '泪目', '这也太强了吧', '有生之年', '爷青回', '前排围观', '名场面', '火钳刘明', '妙啊',
  '我直接好家伙', 'up主辛苦了', '已三连，求更新', '这里笑死我了', '弹幕护体', '2026年还有人在看吗',
  '我宣布这是最好的视频', '全体起立！', '帅！', '再来亿遍', '这个转场绝了', '666666', '???',
  '原来如此', '学到了', '收藏从未停止，学习从未开始', '这是能免费看的吗', '空降成功', '泪目了家人们',
  '神仙打架', '这个BGM是什么', '好耶！', '看呆了', '高能预警', '名场面打卡', '经典永不过时',
]

const COMMENT_POOL = [
  '看完这个视频，我决定今天早点睡觉[doge]',
  '这期质量也太高了吧，up主是不是偷偷招人了',
  '第一次刷到这个up主，直接关注了，太有意思了',
  '我宣布这是今年看过最好的视频，没有之一',
  '三连了，希望 up 主能一直做下去！',
  '每次看都有新的收获，已经二刷了',
  '笑死，弹幕比视频还精彩',
  '看到最后真的绷不住了，泪目',
  '这剪辑功底，没个几年练不出来',
  '收藏了，等有空再看（然后再也没看过）',
  '有没有人和我一样是从首页推荐进来的',
  '这个创意太绝了，怎么想到的啊',
  '强烈建议出续集！！！',
  '看到 3:15 的时候我直接笑出声，室友以为我疯了',
  '这才是 B 站该有的样子',
  'up主声音好好听，可以出个 ASMR 吗',
  '从高中看到大学，现在已经工作了，还在追更',
  '只有我注意到背景里的小猫了吗',
]

const REPLY_POOL = ['确实', '哈哈哈同感', '+1', '说得太对了', '你是懂的', '我也是我也是', '真的假的', '笑死我了', '泪目', '同款心情']

const LIVE_AREAS = ['单机游戏', '网游', '手游', '虚拟主播', '聊天电台', '生活', '知识', '赛事', '娱乐']

// ---------- 用户 ----------
const userCache = new Map()
export function getUser(mid) {
  mid = Number(mid)
  if (userCache.has(mid)) return userCache.get(mid)
  const r = rngFor('user' + mid)
  const user = {
    mid,
    name: UP_NAMES[mid % UP_NAMES.length],
    face: img('face' + mid, 120, 120),
    sign: pick(r, SIGNS),
    level: randInt(r, 4, 6),
    vip: r() > 0.4,
    fans: randInt(r, 5000, 12000000),
    following: randInt(r, 10, 900),
    likes: randInt(r, 100000, 90000000),
    plays: randInt(r, 1000000, 900000000),
    official: r() > 0.6 ? pick(r, ['bilibili 知名UP主', '2025百大UP主', '知名科普UP主', '优质生活领域创作者']) : '',
    banner: img('banner' + mid, 1920, 400),
  }
  userCache.set(mid, user)
  return user
}

// ---------- 视频 ----------
const BV_CHARS = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'
function makeBvid(r) {
  let s = 'BV1'
  for (let i = 0; i < 9; i++) s += BV_CHARS[Math.floor(r() * BV_CHARS.length)]
  return s
}

const videoCache = new Map()
const videoList = []

function makeVideo(i) {
  const r = rngFor('video' + i)
  const bvid = makeBvid(r)
  const mid = randInt(r, 0, UP_NAMES.length - 1)
  const view = Math.floor(Math.pow(r(), 2.2) * 8000000) + randInt(r, 800, 30000)
  const pubdate = NOW - Math.floor(Math.pow(r(), 2) * 86400 * 400 * 1000) - randInt(r, 60, 3000) * 1000
  const title = TITLES[i % TITLES.length]
  const video = {
    idx: i,
    bvid,
    aid: 100000000 + randInt(r, 0, 899999999),
    title,
    cover: img(bvid, 672, 378),
    duration: randInt(r, 25, 2400),
    pubdate,
    view,
    danmaku: Math.floor(view * (0.002 + r() * 0.01)),
    like: Math.floor(view * (0.03 + r() * 0.08)),
    coin: Math.floor(view * (0.005 + r() * 0.03)),
    favorite: Math.floor(view * (0.01 + r() * 0.04)),
    share: Math.floor(view * (0.001 + r() * 0.01)),
    reply: Math.floor(view * (0.001 + r() * 0.004)),
    category: pick(r, CATEGORIES),
    tags: Array.from(new Set(Array.from({ length: randInt(r, 4, 8) }, () => pick(r, TAG_POOL)))),
    desc: `${title.replace(/【.*?】/g, '')}\n\n感谢大家的观看！如果喜欢这期视频，记得一键三连支持一下～\n本期视频拍摄+剪辑耗时约 ${randInt(r, 2, 60)} 天，有任何问题欢迎在评论区留言。\n\nBGM：见评论区置顶\n拍摄设备：${pick(r, ['Sony A7M4', 'iPhone 17 Pro', 'DJI Pocket 4', 'Canon R6'])}`,
    owner: getUser(mid),
    rcmdReason: r() > 0.8 ? (view > 1000000 ? '百万播放' : formatCount(Math.floor(view * 0.08)) + '点赞') : '',
    online: randInt(r, 10, 6000),
  }
  return video
}

for (let i = 0; i < 240; i++) {
  const v = makeVideo(i)
  videoList.push(v)
  videoCache.set(v.bvid, v)
}

export function getVideo(bvid) {
  return videoCache.get(bvid) || videoList[0]
}

export function getFeed(page, size = 11) {
  const out = []
  for (let k = 0; k < size; k++) {
    out.push(videoList[(page * size + k) % videoList.length])
  }
  return out
}

export function shuffleFeed(seed, size = 11) {
  const r = rngFor('shuffle' + seed)
  const out = []
  const used = new Set()
  while (out.length < size) {
    const i = Math.floor(r() * videoList.length)
    if (!used.has(i)) {
      used.add(i)
      out.push(videoList[i])
    }
  }
  return out
}

export function getRelated(bvid, n = 20) {
  const r = rngFor('rel' + bvid)
  const out = []
  const used = new Set([bvid])
  while (out.length < n) {
    const v = videoList[Math.floor(r() * videoList.length)]
    if (!used.has(v.bvid)) {
      used.add(v.bvid)
      out.push(v)
    }
  }
  return out
}

export function getUserVideos(mid) {
  return videoList.filter((v) => v.owner.mid === Number(mid))
}

export function searchVideos(keyword) {
  const kw = (keyword || '').trim().toLowerCase()
  let list = kw
    ? videoList.filter((v) => v.title.toLowerCase().includes(kw) || v.owner.name.toLowerCase().includes(kw) || v.tags.some((t) => t.toLowerCase().includes(kw)) || v.category.includes(kw))
    : []
  // 搜索结果太少时补充相关内容，模拟“综合”排序
  if (list.length < 30) {
    const r = rngFor('search' + kw)
    const extra = videoList.filter((v) => !list.includes(v)).sort(() => r() - 0.5)
    list = list.concat(extra.slice(0, 120 - list.length))
  }
  return list
}

export function searchUsers(keyword) {
  const kw = (keyword || '').trim()
  if (!kw) return []
  const out = []
  UP_NAMES.forEach((name, mid) => {
    if (name.includes(kw)) out.push(getUser(mid))
  })
  return out
}

export function getPopular(type) {
  const sorted = [...videoList]
  if (type === 'rank') return sorted.sort((a, b) => b.view - a.view).slice(0, 100)
  const r = rngFor('popular' + type)
  return sorted.sort(() => r() - 0.5).slice(0, 60)
}

// ---------- 首页轮播 ----------
export const carouselSlides = [
  { title: '2026 bilibili 超级科学晚会 · 正片上线', color: 'rgb(38, 64, 108)', seed: 'slide-science' },
  { title: '秋日限定！跟着UP主一起去看最美的红叶', color: 'rgb(122, 60, 34)', seed: 'slide-autumn' },
  { title: '国创动画年度盛典：这些新番你追了吗？', color: 'rgb(72, 42, 96)', seed: 'slide-anime' },
  { title: 'S16 全球总决赛 · 冠军之夜精彩回顾', color: 'rgb(20, 70, 82)', seed: 'slide-esports' },
  { title: '新星计划 | 万元奖金等你来拿', color: 'rgb(140, 52, 84)', seed: 'slide-newstar' },
  { title: '百大UP主颁奖典礼 · 你的年度最爱是谁', color: 'rgb(48, 86, 62)', seed: 'slide-top100' },
].map((s, i) => ({ ...s, cover: img(s.seed, 1100, 620), bvid: videoList[i * 7 + 3].bvid }))

// ---------- 直播卡片 ----------
export function getLiveCards(page) {
  const r = rngFor('live' + page)
  const user = getUser(randInt(r, 0, UP_NAMES.length - 1))
  return {
    type: 'live',
    roomid: randInt(r, 100000, 30000000),
    title: pick(r, ['今晚通宵！冲刺最强王者', '深夜电台 | 聊聊天唱唱歌', '【新游首发】一起来开荒', '手绘直播：画一只橘猫', '看比赛！S16 同步解说']),
    area: pick(r, LIVE_AREAS),
    online: randInt(r, 2000, 900000),
    cover: img('live' + page, 672, 378),
    owner: user,
  }
}

// ---------- 热搜 ----------
export const hotSearch = [
  { word: 'S16全球总决赛', tag: '热' },
  { word: '黑神话钟馗新实机', tag: '新' },
  { word: '何同学新视频' },
  { word: '原神6.2版本前瞻', tag: '热' },
  { word: '2026超级科学晚会' },
  { word: '秋天的第一杯奶茶' },
  { word: '双十一攻略', tag: '新' },
  { word: '国创动画新番表' },
  { word: '考研倒计时60天' },
  { word: '猫咪的迷惑行为' },
]

// ---------- 评论 ----------
export function getComments(bvid, sort = 'hot') {
  const r = rngFor('cmt' + bvid)
  const video = getVideo(bvid)
  const list = Array.from({ length: 20 }, (_, i) => {
    const user = getUser(randInt(r, 0, UP_NAMES.length - 1))
    const like = Math.floor(Math.pow(r(), 3) * 30000) + randInt(r, 0, 50)
    const ctime = video.pubdate + randInt(r, 60, Math.max(120, (NOW - video.pubdate) / 1000)) * 1000
    const replyCount = r() > 0.45 ? randInt(r, 1, 300) : 0
    return {
      rpid: bvid + '-' + i,
      user: { ...user, name: i % 3 === 0 ? user.name : pick(r, ['路过的', '快乐的', '不吃香菜的', '熬夜的', '摸鱼的']) + pick(r, ['小明', '咸鱼', '打工人', '猫猫', '学生党']) + randInt(r, 1, 9999), face: img('cface' + bvid + i, 96, 96), level: randInt(r, 2, 6), vip: r() > 0.6 },
      content: COMMENT_POOL[(i + randInt(r, 0, 5)) % COMMENT_POOL.length],
      like,
      ctime,
      upLiked: r() > 0.8,
      top: i === 0 && r() > 0.3,
      replyCount,
      replies: Array.from({ length: Math.min(3, replyCount) }, (_, j) => ({
        rpid: bvid + '-' + i + '-' + j,
        user: { name: pick(r, ['热心网友', '吃瓜群众', '路人甲', '课代表', '空降兵']) + randInt(r, 10, 999), face: img('rface' + bvid + i + j, 64, 64), level: randInt(r, 2, 6), vip: r() > 0.7 },
        content: pick(r, REPLY_POOL),
        like: randInt(r, 0, 800),
        ctime: ctime + randInt(r, 60, 86400) * 1000,
      })),
    }
  })
  if (sort === 'new') return [...list].sort((a, b) => b.ctime - a.ctime)
  const [first, ...rest] = list
  return first.top ? [first, ...rest.sort((a, b) => b.like - a.like)] : list.sort((a, b) => b.like - a.like)
}

export function getDanmakuList(bvid, duration) {
  const r = rngFor('dm' + bvid)
  const count = 260
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    time: r() * duration,
    text: pick(r, DANMAKU_POOL),
    color: r() > 0.88 ? pick(r, ['#fe0302', '#ffff00', '#00cd00', '#89d5ff', '#ff7204', '#cc0273']) : '#ffffff',
    mode: r() > 0.94 ? 'top' : 'scroll',
    sendTime: NOW - randInt(r, 60, 86400 * 60) * 1000,
  })).sort((a, b) => a.time - b.time)
}

// 公开可用的示例视频（CC 协议）
export const SAMPLE_SOURCES = [
  'https://media.w3.org/2010/05/sintel/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/trailer.mp4',
  'https://media.w3.org/2010/05/bunny/movie.mp4',
  'https://media.w3.org/2010/05/video/movie_300.mp4',
]

export const CHANNELS_LEFT = ['番剧', '国创', '综艺', '动画', '鬼畜', '舞蹈', '娱乐', '科技', '美食', '汽车', '运动', '电影', '电视剧', '纪录片', '游戏', '音乐', '影视', '知识', '资讯', '生活', '时尚', '更多']

export const LOGIN_USER = {
  mid: 9,
  name: '干杯の小电视',
  face: img('me-face', 120, 120),
  level: 6,
  vip: true,
  coins: 1024,
  bcoin: 5,
  following: 233,
  fans: 66,
  dynamic: 12,
}
