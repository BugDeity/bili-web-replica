<template>
  <div class="space-page">
    <BiliHeader />

    <div class="h" :style="{ backgroundImage: `url(${user.banner})` }">
      <div class="h-gradient"></div>
      <div class="h-inner">
        <div class="h-avatar">
          <img :src="user.face" alt="" />
          <span v-if="user.official" class="official-icon"><Icon name="check" :size="11" :stroke="3.5" /></span>
        </div>
        <div class="h-basic">
          <div class="h-name-row">
            <span class="h-name">{{ user.name }}</span>
            <span class="h-level" :style="{ background: LV_COLORS[user.level] }">LV{{ user.level }}</span>
            <span v-if="user.vip" class="h-vip">年度大会员</span>
          </div>
          <div v-if="user.official" class="h-official"><Icon name="check" :size="12" :stroke="3" />{{ user.official }}</div>
          <div class="h-sign">{{ user.sign }}</div>
        </div>
        <div class="h-action">
          <button class="h-follow" :class="{ on: following }" @click="following = !following">
            {{ following ? '已关注' : '+ 关注' }}
          </button>
          <button class="h-message" @click="toast('私信功能为演示')">发消息</button>
        </div>
      </div>
    </div>

    <div class="n">
      <div class="n-inner">
        <div class="n-tab-links">
          <a v-for="t in navTabs" :key="t.key" class="n-btn" :class="{ active: tab === t.key }" @click="tab = t.key">
            <Icon :name="t.icon" :size="18" :style="{ color: t.color }" />
            <span class="n-text">{{ t.name }}</span>
            <span v-if="t.num !== undefined" class="n-num">{{ t.num }}</span>
          </a>
          <div class="g-search">
            <input v-model="q" placeholder="搜索视频、动态" @keydown.enter="tab = 'video'" />
            <Icon name="search" :size="16" />
          </div>
        </div>
        <div class="n-statistics">
          <div class="n-data"><p class="n-data-k">关注数</p><p class="n-data-v">{{ formatCount(user.following) }}</p></div>
          <div class="n-data"><p class="n-data-k">粉丝数</p><p class="n-data-v">{{ formatCount(user.fans + (following ? 1 : 0)) }}</p></div>
          <div class="n-data"><p class="n-data-k">获赞数</p><p class="n-data-v">{{ formatCount(user.likes) }}</p></div>
          <div class="n-data"><p class="n-data-k">播放数</p><p class="n-data-v">{{ formatCount(user.plays) }}</p></div>
        </div>
      </div>
    </div>

    <div class="s-space">
      <div class="col-1">
        <!-- 主页 -->
        <template v-if="tab === 'home'">
          <section class="section video">
            <h3 class="section-title">
              <span>TA的视频</span><span class="count">{{ videos.length }}</span>
              <a class="more" @click="tab = 'video'">更多 <Icon name="chevron-right" :size="12" :stroke="2.4" /></a>
              <div class="be-tab">
                <span v-for="o in orders" :key="o.key" :class="{ active: order === o.key }" @click="order = o.key">{{ o.name }}</span>
              </div>
            </h3>
            <div class="small-grid">
              <SmallCard v-for="v in sorted.slice(0, 10)" :key="v.bvid" :v="v" />
            </div>
            <div v-if="!videos.length" class="empty">TA还没有投过稿</div>
          </section>
          <section class="section fav">
            <h3 class="section-title"><span>TA的收藏夹</span><span class="count">4</span></h3>
            <div class="fav-grid">
              <div v-for="(f, i) in favs" :key="f.name" class="fav-folder">
                <div class="fav-cover"><LazyImg :src="related[i].cover" /><span class="fav-num">{{ f.count }}</span></div>
                <p class="fav-name">{{ f.name }}</p>
                <p class="fav-meta">公开 · {{ f.count }}个内容</p>
              </div>
            </div>
          </section>
        </template>

        <!-- 投稿 -->
        <template v-else-if="tab === 'video'">
          <section class="section">
            <h3 class="section-title">
              <span>{{ q ? `搜索“${q}”` : '全部视频' }}</span><span class="count">{{ searched.length }}</span>
              <div class="be-tab">
                <span v-for="o in orders" :key="o.key" :class="{ active: order === o.key }" @click="order = o.key">{{ o.name }}</span>
              </div>
            </h3>
            <div class="small-grid">
              <SmallCard v-for="v in searched" :key="v.bvid" :v="v" />
            </div>
            <div v-if="!searched.length" class="empty">没有找到相关视频</div>
          </section>
        </template>

        <!-- 动态 -->
        <template v-else-if="tab === 'dynamic'">
          <section class="section dyn-list">
            <div v-for="v in sorted.slice(0, 6)" :key="v.bvid" class="dyn-item">
              <img :src="user.face" class="dyn-face" alt="" />
              <div class="dyn-body">
                <p class="dyn-name" :class="{ vip: user.vip }">{{ user.name }}</p>
                <p class="dyn-time">{{ formatPubdate(v.pubdate) }} · 投稿了视频</p>
                <router-link :to="`/video/${v.bvid}`" class="dyn-card">
                  <div class="dyn-cover"><LazyImg :src="v.cover" /><span class="dur">{{ formatDuration(v.duration) }}</span></div>
                  <div class="dyn-info">
                    <p class="dyn-title clamp-2">{{ v.title }}</p>
                    <p class="dyn-desc clamp-2">{{ v.desc }}</p>
                    <p class="dyn-stat"><Icon name="play-count" :size="16" :stroke="1.5" />{{ formatCount(v.view) }} <Icon name="danmaku" :size="16" :stroke="1.5" />{{ formatCount(v.danmaku) }}</p>
                  </div>
                </router-link>
                <div class="dyn-actions">
                  <span><Icon name="share-fill" :size="16" />{{ formatCount(v.share) }}</span>
                  <span><Icon name="reply" :size="16" />{{ formatCount(v.reply) }}</span>
                  <span><Icon name="like" :size="16" />{{ formatCount(v.like) }}</span>
                </div>
              </div>
            </div>
          </section>
        </template>

        <template v-else>
          <section class="section"><div class="empty big"><Icon name="tv" :size="72" :stroke="1.2" /><p>这里什么都没有哦~</p></div></section>
        </template>
      </div>

      <div class="col-2">
        <section class="section side">
          <h3 class="side-title">公告</h3>
          <p class="side-text">{{ user.sign }}<br />欢迎来到我的空间！合作请私信~</p>
        </section>
        <section class="section side">
          <h3 class="side-title">个人资料</h3>
          <div class="info-row"><span class="k">UID</span><span class="v">{{ 1000000 + user.mid * 7919 }}</span></div>
          <div class="info-row"><span class="k">生日</span><span class="v">{{ 1 + (user.mid % 12) }}-{{ 1 + (user.mid % 28) }}</span></div>
          <div class="info-row"><span class="k">等级</span><span class="v">LV{{ user.level }}</span></div>
          <div class="info-row" v-if="user.official"><span class="k">认证</span><span class="v">{{ user.official }}</span></div>
        </section>
        <section class="section side">
          <h3 class="side-title">直播间</h3>
          <div class="live-off">
            <LazyImg :src="related[5].cover" class="live-cover" />
            <span class="live-state">未开播</span>
          </div>
        </section>
      </div>
    </div>
    <PaletteButtons />
  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import BiliHeader from '../components/BiliHeader.vue'
import Icon from '../components/Icon.vue'
import LazyImg from '../components/LazyImg.vue'
import PaletteButtons from '../components/PaletteButtons.vue'
import { getUser, getUserVideos, getRelated, formatCount, formatDuration, formatPubdate, LOGIN_USER } from '../data/mock'
import { toast } from '../utils/toast'

const route = useRoute()
const mid = Number(route.params.mid)
const base = getUser(mid)
// 访问自己的空间时使用登录用户的头像昵称
const user = mid === LOGIN_USER.mid ? { ...base, name: LOGIN_USER.name, face: LOGIN_USER.face, vip: true } : base
document.title = `${user.name}的个人空间-哔哩哔哩`

const videos = getUserVideos(mid)
const related = getRelated('space' + mid, 10)
const LV_COLORS = ['#c0c0c0', '#c0c0c0', '#8bd29b', '#7bcdef', '#febb8b', '#ee672a', '#f04c49']

const tab = ref('home')
const navTabs = [
  { key: 'home', name: '主页', icon: 'home', color: '#00c091' },
  { key: 'dynamic', name: '动态', icon: 'dynamic', color: '#fb813f' },
  { key: 'video', name: '投稿', icon: 'play-count', color: '#00a1d6', num: videos.length },
  { key: 'list', name: '合集和列表', icon: 'list-play', color: '#23c9ed', num: 0 },
  { key: 'fav', name: '收藏', icon: 'star', color: '#f3a034', num: 4 },
  { key: 'bangumi', name: '追番追剧', icon: 'tv', color: '#ff5c7c', num: 0 },
]
const orders = [
  { key: 'pubdate', name: '最新发布' },
  { key: 'click', name: '最多播放' },
  { key: 'stow', name: '最多收藏' },
]
const order = ref('pubdate')
const sorted = computed(() => {
  const key = { pubdate: 'pubdate', click: 'view', stow: 'favorite' }[order.value]
  return [...videos].sort((a, b) => b[key] - a[key])
})
const q = ref('')
const searched = computed(() => sorted.value.filter((v) => v.title.includes(q.value.trim())))
const following = ref(false)
const favs = [
  { name: '默认收藏夹', count: 233 },
  { name: '学习资料', count: 56 },
  { name: '音乐', count: 128 },
  { name: '美食', count: 17 },
]

const SmallCard = defineComponent({
  props: { v: Object },
  setup(p) {
    return () =>
      h('div', { class: 'small-item' }, [
        h(RouterLink, { to: `/video/${p.v.bvid}`, class: 'cover' }, () => [h(LazyImg, { src: p.v.cover }), h('span', { class: 'length' }, formatDuration(p.v.duration))]),
        h(RouterLink, { to: `/video/${p.v.bvid}`, class: 'title clamp-2', title: p.v.title }, () => p.v.title),
        h('div', { class: 'meta' }, [
          h('span', { class: 'play' }, [h(Icon, { name: 'play-count', size: 14, stroke: 1.5 }), formatCount(p.v.view)]),
          h('span', { class: 'time' }, formatPubdate(p.v.pubdate)),
        ]),
      ])
  },
})
</script>

<style scoped>
.space-page {
  background: var(--bg2);
  min-height: 100vh;
  padding-bottom: 60px;
}
.h {
  position: relative;
  width: 1280px;
  max-width: calc(100% - 40px);
  height: 200px;
  margin: 0 auto;
  background-size: cover;
  background-position: center;
  border-radius: 0 0 0 0;
}
.h-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.55));
}
.h-inner {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 20px;
  display: flex;
  align-items: center;
}
.h-avatar {
  position: relative;
  width: 68px;
  height: 68px;
  margin-right: 18px;
  flex-shrink: 0;
}
.h-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  object-fit: cover;
  background: var(--graph_bg_regular);
}
.official-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #ffc62e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.h-basic {
  flex: 1;
  min-width: 0;
  color: #fff;
}
.h-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.h-name {
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.h-level {
  font-size: 10px;
  font-weight: 700;
  font-style: italic;
  padding: 0 4px;
  border-radius: 2px;
  line-height: 15px;
}
.h-vip {
  padding: 0 5px;
  border-radius: 8px;
  background: var(--brand_pink);
  font-size: 11px;
  line-height: 16px;
}
.h-official {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-bottom: 4px;
  color: #ffd770;
}
.h-sign {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.h-action {
  display: flex;
  gap: 10px;
}
.h-follow,
.h-message {
  width: 100px;
  height: 34px;
  border-radius: 6px;
  font-size: 14px;
  color: #fff;
}
.h-follow {
  background: var(--brand_blue);
}
.h-follow.on {
  background: rgba(255, 255, 255, 0.25);
}
.h-message {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.n {
  width: 1280px;
  max-width: calc(100% - 40px);
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 0 0 1px #eee;
  border-radius: 0 0 6px 6px;
}
.n-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 66px;
  padding: 0 20px;
}
.n-tab-links {
  display: flex;
  align-items: center;
  height: 100%;
}
.n-btn {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin-right: 26px;
  cursor: pointer;
  color: var(--text1);
}
.n-btn .n-text {
  margin-left: 6px;
  font-size: 15px;
}
.n-btn:hover .n-text,
.n-btn.active .n-text {
  color: var(--brand_blue);
}
.n-btn.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: var(--brand_blue);
}
.n-num {
  margin-left: 5px;
  font-size: 12px;
  color: var(--text3);
}
.g-search {
  display: flex;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  border-left: 1px solid var(--line_regular);
  color: var(--text3);
}
.g-search input {
  width: 130px;
  font-size: 12px;
  margin-right: 4px;
}
.n-statistics {
  display: flex;
}
.n-data {
  padding: 0 14px;
  text-align: center;
}
.n-data-k {
  font-size: 12px;
  color: var(--text3);
  line-height: 18px;
}
.n-data-v {
  font-size: 14px;
  color: var(--text1);
  line-height: 18px;
}

.s-space {
  display: flex;
  gap: 20px;
  width: 1280px;
  max-width: calc(100% - 40px);
  margin: 12px auto 0;
}
.col-1 {
  flex: 1;
  min-width: 0;
}
.col-2 {
  width: 300px;
  flex-shrink: 0;
}
.section {
  background: #fff;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 0 0 1px #eee;
}
.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 400;
  color: var(--text1);
  margin-bottom: 16px;
}
.section-title .count {
  margin-left: 10px;
  font-size: 12px;
  color: var(--text3);
}
.section-title .more {
  display: flex;
  align-items: center;
  margin-left: 16px;
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
}
.section-title .more:hover {
  color: var(--brand_blue);
}
.be-tab {
  margin-left: auto;
  display: flex;
  gap: 4px;
}
.be-tab span {
  padding: 0 10px;
  height: 26px;
  line-height: 26px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
}
.be-tab span.active {
  background: var(--brand_blue);
  color: #fff;
}
.small-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 22px 16px;
}
:deep(.small-item .cover) {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  overflow: hidden;
}
:deep(.small-item .cover .lazy-wrap) {
  width: 100%;
  height: 100%;
}
:deep(.small-item .length) {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 0 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  line-height: 18px;
}
:deep(.small-item .title) {
  margin-top: 8px;
  font-size: 13px;
  line-height: 20px;
  height: 40px;
  color: var(--text1);
}
:deep(.small-item .title:hover) {
  color: var(--brand_blue);
}
:deep(.small-item .meta) {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text3);
}
:deep(.small-item .play) {
  display: flex;
  align-items: center;
  gap: 2px;
}
.fav-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}
.fav-cover {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 6px;
  overflow: hidden;
}
.fav-cover .lazy-wrap {
  width: 100%;
  height: 100%;
}
.fav-num {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 40%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.fav-name {
  margin-top: 8px;
  font-size: 14px;
}
.fav-meta {
  font-size: 12px;
  color: var(--text3);
  margin-top: 2px;
}
.empty {
  padding: 40px 0;
  text-align: center;
  color: var(--text3);
  font-size: 13px;
}
.empty.big {
  padding: 80px 0;
  color: var(--text4);
}
.empty.big p {
  margin-top: 12px;
  color: var(--text3);
}
.side-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}
.side-text {
  font-size: 13px;
  line-height: 22px;
  color: var(--text2);
}
.info-row {
  display: flex;
  font-size: 13px;
  line-height: 28px;
}
.info-row .k {
  width: 50px;
  color: var(--text3);
}
.info-row .v {
  color: var(--text1);
}
.live-off {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
}
.live-cover {
  aspect-ratio: 16 / 9;
  filter: grayscale(0.7);
}
.live-state {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 0 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  line-height: 20px;
}

/* 动态 */
.dyn-item {
  display: flex;
  padding: 18px 0;
  border-bottom: 1px solid var(--line_light);
}
.dyn-item:last-child {
  border-bottom: none;
}
.dyn-face {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 14px;
  object-fit: cover;
}
.dyn-body {
  flex: 1;
  min-width: 0;
}
.dyn-name {
  font-size: 15px;
  font-weight: 500;
}
.dyn-name.vip {
  color: var(--brand_pink);
}
.dyn-time {
  font-size: 12px;
  color: var(--text3);
  margin: 2px 0 12px;
}
.dyn-card {
  display: flex;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.dyn-card:hover {
  border-color: var(--brand_blue);
}
.dyn-cover {
  position: relative;
  width: 260px;
  aspect-ratio: 16 / 10;
  flex-shrink: 0;
}
.dyn-cover .lazy-wrap {
  width: 100%;
  height: 100%;
}
.dyn-cover .dur {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 0 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
}
.dyn-info {
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}
.dyn-title {
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
}
.dyn-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 20px;
  color: var(--text3);
}
.dyn-stat {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text3);
}
.dyn-actions {
  display: flex;
  gap: 60px;
  margin-top: 12px;
  font-size: 13px;
  color: var(--text3);
}
.dyn-actions span {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.dyn-actions span:hover {
  color: var(--brand_blue);
}
@media (max-width: 1300px) {
  .small-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .n-statistics .n-data:nth-child(n + 4) {
    display: none;
  }
}
</style>
