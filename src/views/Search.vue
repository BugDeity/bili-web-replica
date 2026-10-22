<template>
  <div class="search-page">
    <BiliHeader hide-search />

    <div class="search-header">
      <form class="search-input-wrap" @submit.prevent="submit">
        <div class="search-input" :class="{ focus: inputFocus }">
          <Icon name="search" :size="18" class="input-icon" />
          <input
            v-model="input"
            class="search-input-el"
            maxlength="100"
            placeholder="输入关键字搜索"
            @focus="inputFocus = true"
            @blur="inputFocus = false"
          />
          <button v-show="input" type="button" class="clear-btn" @click="input = ''">
            <Icon name="close" :size="12" :stroke="2.4" />
          </button>
        </div>
        <button type="submit" class="search-button btn-blue">
          <Icon name="search" :size="18" :stroke="2" />
          <span>搜索</span>
        </button>
      </form>

      <nav class="vui_tabs--nav">
        <a
          v-for="t in tabs"
          :key="t.key"
          class="vui_tabs--nav-item"
          :class="{ active: tab === t.key }"
          @click="setTab(t.key)"
        >
          {{ t.name }}<span v-if="t.count" class="nav-count">{{ t.count }}</span>
        </a>
      </nav>
    </div>

    <div class="search-content">
      <!-- 筛选条件 -->
      <div v-if="tab === 'all' || tab === 'video'" class="search-conditions">
        <div class="conditions-order">
          <button
            v-for="o in orders"
            :key="o.key"
            class="order-btn"
            :class="{ active: order === o.key }"
            @click="setOrder(o.key)"
          >{{ o.name }}</button>
          <button class="more-conditions" @click="showMore = !showMore">
            更多筛选<Icon :name="showMore ? 'chevron-up' : 'chevron-down'" :size="12" :stroke="2.4" />
          </button>
        </div>
        <div v-if="showMore" class="conditions-more">
          <div class="cond-row">
            <button v-for="d in durations" :key="d" class="order-btn" :class="{ active: duration === d }" @click="duration = d; page = 1">{{ d }}</button>
          </div>
          <div class="cond-row">
            <button v-for="c in cats" :key="c" class="order-btn" :class="{ active: cat === c }" @click="cat = c; page = 1">{{ c }}</button>
          </div>
        </div>
      </div>

      <!-- 用户卡片 -->
      <div v-if="(tab === 'all' && users.length) || tab === 'user'" class="user-list">
        <div v-for="u in (tab === 'user' ? allUsers : users.slice(0, 1))" :key="u.mid" class="user-card">
          <router-link :to="`/space/${u.mid}`" class="user-avatar"><img :src="u.face" alt="" /></router-link>
          <div class="user-info">
            <router-link :to="`/space/${u.mid}`" class="user-name" :class="{ vip: u.vip }" v-html="hl(u.name)"></router-link>
            <p class="user-meta">{{ formatCount(u.fans) }}粉丝 · {{ videosOf(u.mid) }}个视频</p>
            <p class="user-sign ellipsis">{{ u.official || u.sign }}</p>
            <button class="follow-btn" :class="{ on: followed.has(u.mid) }" @click="toggleFollow(u.mid)">
              {{ followed.has(u.mid) ? '已关注' : '+ 关注' }}
            </button>
          </div>
        </div>
      </div>

      <template v-if="tab === 'all' || tab === 'video'">
        <div class="video-list" :style="{ '--cols': cols }">
          <VideoCard v-for="v in pageList" :key="v.bvid" :video="v" :keyword="keyword" hide-reason />
        </div>

        <div class="vui_pagenation" v-if="totalPages > 1">
          <button class="page-btn side" :disabled="page === 1" @click="goto(page - 1)">上一页</button>
          <template v-for="p in pageNums" :key="p">
            <span v-if="p === '...'" class="page-ellipsis">...</span>
            <button v-else class="page-btn" :class="{ active: p === page }" @click="goto(p)">{{ p }}</button>
          </template>
          <button class="page-btn side" :disabled="page === totalPages" @click="goto(page + 1)">下一页</button>
        </div>
      </template>

      <div v-else-if="tab !== 'user'" class="search-nodata">
        <Icon name="tv" :size="80" :stroke="1.2" />
        <p>没有找到相关的{{ tabs.find((t) => t.key === tab).name }}内容，换个关键词试试吧~</p>
      </div>
    </div>

    <PaletteButtons />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BiliHeader from '../components/BiliHeader.vue'
import VideoCard from '../components/VideoCard.vue'
import Icon from '../components/Icon.vue'
import PaletteButtons from '../components/PaletteButtons.vue'
import { searchVideos, searchUsers, getUser, getUserVideos, formatCount, rngFor } from '../data/mock'
import { toast } from '../utils/toast'

const route = useRoute()
const router = useRouter()

const keyword = computed(() => String(route.query.keyword || ''))
const input = ref(keyword.value)
const inputFocus = ref(false)
watch(keyword, (k) => {
  input.value = k
  document.title = `${k}-哔哩哔哩_bilibili`
}, { immediate: true })

const tab = ref('all')
const order = ref('totalrank')
const page = ref(Number(route.query.page) || 1)
const showMore = ref(false)
const durations = ['全部时长', '10分钟以下', '10-30分钟', '30-60分钟', '60分钟以上']
const duration = ref('全部时长')
const cats = ['全部分区', '生活', '知识', '游戏', '音乐', '美食', '科技', '动画', '鬼畜', '舞蹈', '影视']
const cat = ref('全部分区')

const orders = [
  { key: 'totalrank', name: '综合排序' },
  { key: 'click', name: '最多播放' },
  { key: 'pubdate', name: '最新发布' },
  { key: 'dm', name: '最多弹幕' },
  { key: 'stow', name: '最多收藏' },
]

const allVideos = computed(() => searchVideos(keyword.value))
const users = computed(() => searchUsers(keyword.value))
// 用户 tab：没有精确匹配时也展示一些“相关用户”
const allUsers = computed(() => {
  if (users.value.length) return users.value
  const r = rngFor('su' + keyword.value)
  return Array.from({ length: 8 }, () => getUser(Math.floor(r() * 40))).filter((u, i, a) => a.findIndex((x) => x.mid === u.mid) === i)
})

const filtered = computed(() => {
  let list = [...allVideos.value]
  if (cat.value !== '全部分区') list = list.filter((v) => v.category === cat.value)
  const d = duration.value
  if (d === '10分钟以下') list = list.filter((v) => v.duration < 600)
  else if (d === '10-30分钟') list = list.filter((v) => v.duration >= 600 && v.duration < 1800)
  else if (d === '30-60分钟') list = list.filter((v) => v.duration >= 1800 && v.duration < 3600)
  else if (d === '60分钟以上') list = list.filter((v) => v.duration >= 3600)
  const key = { click: 'view', pubdate: 'pubdate', dm: 'danmaku', stow: 'favorite' }[order.value]
  if (key) list.sort((a, b) => b[key] - a[key])
  return list
})

const tabs = computed(() => [
  { key: 'all', name: '综合' },
  { key: 'video', name: '视频', count: filtered.value.length > 99 ? '99+' : filtered.value.length },
  { key: 'bangumi', name: '番剧', count: 0 },
  { key: 'movie', name: '影视', count: 0 },
  { key: 'live', name: '直播', count: 0 },
  { key: 'article', name: '专栏', count: 0 },
  { key: 'user', name: '用户', count: allUsers.value.length },
])

const width = ref(window.innerWidth)
const onResize = () => (width.value = window.innerWidth)
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
const cols = computed(() => (width.value < 1400 ? 4 : width.value < 1900 ? 5 : 6))
const pageSize = computed(() => cols.value * 6)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))
const pageList = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
const pageNums = computed(() => {
  const n = totalPages.value
  const p = page.value
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const out = [1]
  if (p > 4) out.push('...')
  for (let i = Math.max(2, p - 2); i <= Math.min(n - 1, p + 2); i++) out.push(i)
  if (p < n - 3) out.push('...')
  out.push(n)
  return out
})

function submit() {
  const k = input.value.trim()
  if (!k) return toast('请输入搜索内容')
  page.value = 1
  router.push({ path: '/search', query: { keyword: k } })
}
function setTab(t) {
  tab.value = t
  page.value = 1
}
function setOrder(o) {
  order.value = o
  page.value = 1
}
function goto(p) {
  page.value = p
  window.scrollTo({ top: 0 })
}
watch(keyword, () => (page.value = 1))

const followed = ref(new Set())
function toggleFollow(mid) {
  const s = new Set(followed.value)
  s.has(mid) ? s.delete(mid) : s.add(mid)
  followed.value = s
}
const videosOf = (mid) => getUserVideos(mid).length

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
function hl(text) {
  const kw = esc(keyword.value)
  const t = esc(text)
  return kw ? t.split(kw).join(`<em class="keyword">${kw}</em>`) : t
}
</script>

<style scoped>
.search-page {
  padding-bottom: 60px;
}
.search-header {
  max-width: 2560px;
  margin: 0 auto;
  padding: 0 64px;
}
.search-input-wrap {
  display: flex;
  justify-content: center;
  margin: 40px auto 20px;
  max-width: 760px;
}
.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 14px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  background: var(--bg2);
  transition: all 0.2s;
}
.search-input:hover {
  background: #fff;
}
.search-input.focus {
  background: #fff;
  border-color: var(--brand_blue);
}
.input-icon {
  color: var(--text3);
  margin-right: 10px;
}
.search-input-el {
  flex: 1;
  height: 100%;
  font-size: 16px;
}
.clear-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 120px;
  height: 50px;
  margin-left: 10px;
  font-size: 16px;
}
.vui_tabs--nav {
  display: flex;
  align-items: center;
  height: 56px;
  border-bottom: 1px solid var(--line_regular);
}
.vui_tabs--nav-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  margin-right: 36px;
  font-size: 16px;
  color: var(--text1);
  cursor: pointer;
  transition: color 0.2s;
}
.vui_tabs--nav-item:hover,
.vui_tabs--nav-item.active {
  color: var(--brand_blue);
}
.vui_tabs--nav-item.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: var(--brand_blue);
  border-radius: 1px;
}
.nav-count {
  margin-left: 4px;
  font-size: 12px;
  color: var(--text3);
}

.search-content {
  max-width: 2560px;
  margin: 0 auto;
  padding: 0 64px;
}
.search-conditions {
  padding: 20px 0 4px;
}
.conditions-order,
.cond-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.cond-row {
  margin-top: 12px;
}
.order-btn {
  height: 34px;
  padding: 0 15px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--text2);
  transition: all 0.2s;
}
.order-btn:hover {
  color: var(--brand_blue);
}
.order-btn.active {
  background: var(--brand_blue_thin);
  color: var(--brand_blue);
}
.more-conditions {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 34px;
  padding: 0 14px;
  margin-left: auto;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  font-size: 14px;
  color: var(--text2);
}
.more-conditions:hover {
  background: var(--graph_bg_regular);
}

.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  margin: 20px 0 10px;
}
.user-card {
  display: flex;
  padding: 16px 0;
}
.user-avatar img {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_regular);
}
.user-info {
  margin-left: 20px;
  min-width: 0;
  flex: 1;
}
.user-name {
  display: inline-block;
  font-size: 18px;
  font-weight: 500;
  color: var(--text1);
  margin-bottom: 6px;
}
.user-name.vip {
  color: var(--brand_pink);
}
.user-name :deep(.keyword) {
  font-style: normal;
  color: var(--keyword);
}
.user-meta,
.user-sign {
  font-size: 13px;
  color: var(--text3);
  line-height: 20px;
}
.follow-btn {
  margin-top: 8px;
  height: 32px;
  padding: 0 22px;
  border-radius: 6px;
  background: var(--brand_blue);
  color: #fff;
  font-size: 13px;
}
.follow-btn.on {
  background: var(--graph_bg_thick);
  color: var(--text2);
}

.video-list {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 20px;
  row-gap: 30px;
  margin-top: 20px;
}

.vui_pagenation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 50px 0 20px;
}
.page-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  background: #fff;
  font-size: 14px;
  color: var(--text1);
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--brand_blue);
  color: var(--brand_blue);
}
.page-btn.active {
  background: var(--brand_blue);
  border-color: var(--brand_blue);
  color: #fff;
}
.page-btn.active:hover {
  color: #fff;
}
.page-btn.side {
  padding: 0 18px;
}
.page-btn:disabled {
  color: var(--text4);
  cursor: not-allowed;
}
.page-ellipsis {
  color: var(--text3);
  padding: 0 4px;
}
.search-nodata {
  padding: 100px 0;
  text-align: center;
  color: var(--text4);
}
.search-nodata p {
  margin-top: 16px;
  font-size: 14px;
  color: var(--text3);
}
</style>
