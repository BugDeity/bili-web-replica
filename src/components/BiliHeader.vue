<template>
  <header class="bili-header" :class="{ 'has-banner': banner }">
    <div
      class="bili-header__bar"
      :class="{ 'is-transparent': banner && !fixed, 'is-fixed': fixed, 'slide-down': banner && fixed }"
    >
      <!-- 左侧入口 -->
      <ul class="left-entry">
        <li class="left-entry__item home">
          <router-link to="/" class="entry-link">
            <Icon name="tv" :size="20" :stroke="2.1" class="tv-logo" />
            <span>首页</span>
          </router-link>
        </li>
        <li v-for="e in leftEntries" :key="e" class="left-entry__item">
          <a class="entry-link" href="javascript:;" @click="soon(e)">{{ e }}</a>
        </li>
        <li class="left-entry__item download">
          <a class="entry-link" href="javascript:;" @click="soon('下载客户端')">
            <Icon name="download" :size="16" />
            <span>下载客户端</span>
          </a>
        </li>
      </ul>

      <!-- 搜索框 -->
      <div class="center-search-container">
        <div v-if="!hideSearch" class="center-search__bar" :class="{ 'is-focus': focused }" v-click-outside="() => (focused = false)">
          <form class="nav-searchform" @submit.prevent="doSearch()">
            <div class="nav-search-content">
              <input
                ref="inputRef"
                v-model="keyword"
                class="nav-search-input"
                type="text"
                maxlength="100"
                autocomplete="off"
                :placeholder="placeholder"
                @focus="focused = true"
                @keydown.esc="focused = false; inputRef.blur()"
              />
              <button v-show="keyword" type="button" class="nav-search-clean" @click="keyword = ''; inputRef.focus()">
                <Icon name="close" :size="12" :stroke="2.4" />
              </button>
            </div>
            <button type="submit" class="nav-search-btn" title="搜索">
              <Icon name="search" :size="17" :stroke="2" />
            </button>
          </form>

          <div v-show="focused" class="search-panel">
            <div v-if="history.length" class="history">
              <div class="panel-header">
                <span>搜索历史</span>
                <button class="clear" @click="clearHistory">清空</button>
              </div>
              <div class="history-wrap">
                <a v-for="h in history" :key="h" class="history-item" @mousedown.prevent="doSearch(h)">
                  <span class="ellipsis">{{ h }}</span>
                  <i class="history-close" @mousedown.stop.prevent="removeHistory(h)"><Icon name="close" :size="10" :stroke="2.6" /></i>
                </a>
              </div>
            </div>
            <div class="trending">
              <div class="panel-header"><span>bilibili热搜</span></div>
              <div class="trending-wrap">
                <a v-for="(t, i) in hotSearch" :key="t.word" class="trending-item" @mousedown.prevent="doSearch(t.word)">
                  <span class="trending-rank" :class="{ top: i < 3 }">{{ i + 1 }}</span>
                  <span class="trending-text ellipsis">{{ t.word }}</span>
                  <span v-if="t.tag" class="trending-mark" :class="t.tag === '新' ? 'is-new' : 'is-hot'">{{ t.tag }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧入口 -->
      <ul class="right-entry">
        <li class="header-avatar-wrap" @mouseenter="openAvatar" @mouseleave="closeAvatar">
          <router-link :to="`/space/${me.mid}`" class="header-entry-avatar" :class="{ big: avatarOpen }">
            <img :src="me.face" alt="" />
          </router-link>
          <transition name="fade">
            <div v-show="avatarOpen" class="avatar-panel">
              <div class="nickname" :class="{ vip: me.vip }">{{ me.name }}</div>
              <div class="level-info">
                <span class="lv-badge">LV{{ me.level }}</span>
                <span class="vip-tag" v-if="me.vip">年度大会员</span>
              </div>
              <div class="coins">
                <span>硬币: <b>{{ me.coins }}</b></span>
                <span>B币: <b>{{ me.bcoin }}</b></span>
              </div>
              <div class="counts">
                <router-link :to="`/space/${me.mid}`" class="count-item"><b>{{ me.following }}</b><span>关注</span></router-link>
                <router-link :to="`/space/${me.mid}`" class="count-item"><b>{{ me.fans }}</b><span>粉丝</span></router-link>
                <router-link :to="`/space/${me.mid}`" class="count-item"><b>{{ me.dynamic }}</b><span>动态</span></router-link>
              </div>
              <div class="links">
                <router-link :to="`/space/${me.mid}`" class="link-item"><Icon name="user" :size="18" /><span>个人中心</span><Icon name="chevron-right" :size="14" class="arrow" /></router-link>
                <a class="link-item" @click="soon('投稿管理')"><Icon name="upload" :size="18" /><span>投稿管理</span><Icon name="chevron-right" :size="14" class="arrow" /></a>
                <a class="link-item" @click="soon('B币钱包')"><Icon name="coin-fill" :size="18" /><span>B币钱包</span><Icon name="chevron-right" :size="14" class="arrow" /></a>
                <a class="link-item" @click="soon('订单中心')"><Icon name="article" :size="18" /><span>订单中心</span><Icon name="chevron-right" :size="14" class="arrow" /></a>
              </div>
              <div class="split-line"></div>
              <a class="logout" @click="soon('退出登录')"><Icon name="logout" :size="18" /><span>退出登录</span></a>
            </div>
          </transition>
        </li>
        <li v-for="e in rightEntries" :key="e.text" class="right-entry__item" @click="e.to ? $router.push(e.to) : soon(e.text)">
          <div class="right-entry-icon">
            <Icon :name="e.icon" :size="20" />
            <span v-if="e.badge" class="red-num">{{ e.badge }}</span>
            <span v-if="e.dot" class="red-dot"></span>
          </div>
          <span class="right-entry-text">{{ e.text }}</span>
        </li>
        <li class="right-entry__upload">
          <a class="upload-btn" @click="soon('投稿')">
            <Icon name="upload" :size="18" :stroke="2" />
            <span>投稿</span>
          </a>
        </li>
      </ul>
    </div>

    <!-- 首页大 Banner -->
    <div v-if="banner" class="bili-header__banner">
      <div class="banner-img" :style="{ backgroundImage: `url(${bannerImg})` }"></div>
      <div class="banner-mask"></div>
      <router-link to="/" class="banner-logo">
        <svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="2" y="6" width="20" height="15" rx="4"/><path d="M7.5 2.5 10.5 6M16.5 2.5 13.5 6M8 12.5v2M16 12.5v2"/></svg>
        <span>bilibili</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { hotSearch, LOGIN_USER, img } from '../data/mock'
import { toast } from '../utils/toast'

const props = defineProps({
  banner: { type: Boolean, default: false },
  hideSearch: Boolean,
})

const route = useRoute()
const router = useRouter()
const me = LOGIN_USER
const bannerImg = img('bili-banner-autumn-2026', 2000, 420)

const leftEntries = ['番剧', '直播', '游戏中心', '会员购', '漫画', '赛事']
const rightEntries = [
  { text: '大会员', icon: 'vip' },
  { text: '消息', icon: 'message', badge: 12 },
  { text: '动态', icon: 'dynamic', dot: true },
  { text: '收藏', icon: 'star' },
  { text: '历史', icon: 'history' },
  { text: '创作中心', icon: 'creation' },
]

// 搜索
const inputRef = ref(null)
const keyword = ref(route.name === 'search' ? route.query.keyword || '' : '')
const focused = ref(false)
const placeholder = hotSearch[Math.floor(Math.random() * 5)].word
const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('bili_search_history') || '[]')
  } catch {
    return []
  }
}
const history = ref(loadHistory())
const saveHistory = () => {
  try {
    localStorage.setItem('bili_search_history', JSON.stringify(history.value))
  } catch {}
}
function doSearch(word) {
  const kw = (word ?? keyword.value).trim() || placeholder
  keyword.value = kw
  history.value = [kw, ...history.value.filter((h) => h !== kw)].slice(0, 10)
  saveHistory()
  focused.value = false
  inputRef.value?.blur()
  router.push({ path: '/search', query: { keyword: kw } })
}
function removeHistory(h) {
  history.value = history.value.filter((x) => x !== h)
  saveHistory()
}
function clearHistory() {
  history.value = []
  saveHistory()
}

// 头像面板
const avatarOpen = ref(false)
let avatarTimer = null
function openAvatar() {
  clearTimeout(avatarTimer)
  avatarTimer = setTimeout(() => (avatarOpen.value = true), 120)
}
function closeAvatar() {
  clearTimeout(avatarTimer)
  avatarTimer = setTimeout(() => (avatarOpen.value = false), 200)
}

function soon(name) {
  toast(`「${name}」是演示入口，暂未实现`)
}

// 首页滚动后切换为白色固定头部
const fixed = ref(!props.banner)
function onScroll() {
  if (!props.banner) return
  fixed.value = window.scrollY > 64
}
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const vClickOutside = {
  mounted(el, binding) {
    el._co = (e) => !el.contains(e.target) && binding.value(e)
    document.addEventListener('mousedown', el._co)
  },
  unmounted(el) {
    document.removeEventListener('mousedown', el._co)
  },
}
</script>

<style scoped>
.bili-header {
  position: relative;
  width: 100%;
  min-height: 64px;
}

.bili-header__bar {
  position: relative;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  width: 100%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  color: var(--text1);
}
.has-banner .bili-header__bar {
  position: absolute;
  top: 0;
  left: 0;
}
.bili-header__bar.is-transparent {
  background: transparent;
  box-shadow: none;
  color: #fff;
}
.has-banner .bili-header__bar.is-fixed {
  position: fixed;
}
.bili-header__bar.slide-down {
  animation: headerSlideDown 0.3s ease;
}
@keyframes headerSlideDown {
  from {
    transform: translateY(-100%);
  }
}

/* 左侧 */
.left-entry {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 30px;
}
.left-entry__item {
  margin-right: 18px;
  height: 64px;
  display: flex;
  align-items: center;
}
.entry-link {
  display: flex;
  align-items: center;
  height: 100%;
  font-size: 14px;
  white-space: nowrap;
  transition: transform 0.2s;
}
.entry-link:hover {
  animation: jump 0.3s;
}
.is-transparent .entry-link,
.is-transparent .right-entry-text {
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
}
.is-transparent .bili-icon {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25));
}
.home .tv-logo {
  margin-right: 6px;
  color: var(--brand_blue);
}
.is-transparent .home .tv-logo {
  color: #fff;
}
.download .entry-link .bili-icon {
  margin-right: 4px;
}
@keyframes jump {
  0% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}

/* 搜索 */
.center-search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 180px;
}
.center-search__bar {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  height: 40px;
}
.nav-searchform {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 48px 0 4px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  background: var(--graph_bg_regular);
  opacity: 0.9;
  transition: background-color 0.3s, opacity 0.3s;
  z-index: 2;
}
.is-transparent .nav-searchform {
  border-color: transparent;
  background: rgba(255, 255, 255, 0.88);
}
.center-search__bar:hover .nav-searchform,
.center-search__bar.is-focus .nav-searchform {
  background: #fff;
  opacity: 1;
}
.center-search__bar.is-focus .nav-searchform {
  border-radius: 8px 8px 0 0;
  border-bottom-color: transparent;
}
.nav-search-content {
  flex: 1;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: background 0.3s;
}
.center-search__bar.is-focus .nav-search-content {
  background: var(--graph_bg_thick);
}
.nav-search-input {
  flex: 1;
  height: 100%;
  font-size: 14px;
  color: var(--text1);
}
.nav-search-input::placeholder {
  color: var(--text3);
}
.center-search__bar.is-focus .nav-search-input::placeholder {
  color: var(--text2);
}
.nav-search-clean {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--text3);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
}
.nav-search-btn {
  position: absolute;
  right: 7px;
  top: 3px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text1);
  transition: background 0.3s;
}
.nav-search-btn:hover {
  background: var(--graph_bg_thick);
}

.search-panel {
  position: absolute;
  top: 39px;
  left: 0;
  width: 100%;
  padding: 13px 0 16px;
  background: #fff;
  border: 1px solid var(--line_regular);
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  color: var(--text1);
  max-height: 612px;
  overflow-y: auto;
  z-index: 1;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 24px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
}
.panel-header .clear {
  font-size: 12px;
  color: var(--text3);
}
.panel-header .clear:hover {
  color: var(--brand_blue);
}
.history {
  margin-bottom: 14px;
}
.history-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 16px;
}
.history-item {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 100%;
  height: 30px;
  padding: 0 10px;
  font-size: 12px;
  line-height: 30px;
  background: var(--bg2);
  border-radius: 4px;
  cursor: pointer;
}
.history-item:hover {
  color: var(--brand_blue);
}
.history-close {
  display: none;
  position: absolute;
  right: -6px;
  top: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--text3);
  color: #fff;
  align-items: center;
  justify-content: center;
}
.history-item:hover .history-close {
  display: flex;
}
.trending-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.trending-item {
  display: flex;
  align-items: center;
  height: 38px;
  padding-left: 16px;
  cursor: pointer;
  min-width: 0;
}
.trending-item:hover {
  background: var(--bg3);
}
.trending-rank {
  width: 15px;
  margin-right: 7px;
  font-size: 14px;
  color: var(--text3);
  text-align: center;
  flex-shrink: 0;
}
.trending-rank.top {
  color: var(--text1);
  font-weight: 500;
}
.trending-text {
  font-size: 14px;
  min-width: 0;
}
.trending-mark {
  margin-left: 5px;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  color: #fff;
  flex-shrink: 0;
}
.trending-mark.is-new {
  background: #ff6633;
}
.trending-mark.is-hot {
  background: #f85a54;
}

/* 右侧 */
.right-entry {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 20px;
}
.header-avatar-wrap {
  position: relative;
  width: 50px;
  height: 50px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-entry-avatar {
  position: relative;
  z-index: 3;
  display: block;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #fff;
  overflow: hidden;
  background: var(--graph_bg_regular);
  transition: transform 0.3s, width 0.3s;
}
.header-entry-avatar.big {
  transform: translate(0, 26px) scale(2);
}
.header-entry-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-panel {
  position: absolute;
  top: 60px;
  left: 50%;
  width: 300px;
  margin-left: -150px;
  padding: 50px 24px 18px;
  background: #fff;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  color: var(--text1);
  z-index: 2;
  text-align: center;
}
.nickname {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 4px;
}
.nickname.vip {
  color: var(--brand_pink);
}
.level-info {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}
.lv-badge {
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #ff6c00;
  border-radius: 2px;
  padding: 0 4px;
  line-height: 16px;
}
.vip-tag {
  font-size: 10px;
  color: #fff;
  background: var(--brand_pink);
  border-radius: 2px;
  padding: 0 4px;
  line-height: 16px;
}
.coins {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 14px;
}
.coins b {
  color: var(--text1);
  font-weight: 400;
}
.counts {
  display: flex;
  justify-content: space-around;
  margin-bottom: 14px;
}
.count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.count-item b {
  font-size: 18px;
  font-weight: 500;
}
.count-item span {
  font-size: 12px;
  color: var(--text3);
}
.count-item:hover b,
.count-item:hover span {
  color: var(--brand_blue);
}
.links {
  text-align: left;
}
.link-item,
.logout {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 12px;
  margin: 0 -12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
}
.link-item span,
.logout span {
  flex: 1;
  margin-left: 12px;
}
.link-item:hover,
.logout:hover {
  background: var(--graph_bg_thick);
}
.link-item .arrow {
  color: var(--text3);
}
.split-line {
  height: 1px;
  background: var(--line_regular);
  margin: 6px 0;
}

.right-entry__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  height: 50px;
  margin-right: 0;
  cursor: pointer;
}
.right-entry__item:hover .right-entry-icon {
  animation: jump 0.3s;
}
.right-entry-icon {
  position: relative;
  height: 20px;
}
.right-entry-text {
  margin-top: 1px;
  font-size: 13px;
  white-space: nowrap;
}
.red-num {
  position: absolute;
  top: -6px;
  left: 12px;
  min-width: 16px;
  height: 15px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
}
.red-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--brand_pink);
  border: 1px solid #fff;
}
.right-entry__upload {
  margin-left: 12px;
}
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 34px;
  border-radius: 8px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}
.upload-btn:hover {
  background: #fc8bab;
}
.upload-btn .bili-icon {
  margin-right: 4px;
}

/* Banner */
.bili-header__banner {
  position: relative;
  z-index: 1;
  height: 9.375vw;
  min-height: 155px;
  max-height: 240px;
  overflow: hidden;
  background: #c4dcf0;
}
.banner-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center 40%;
}
.banner-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(0, 0, 0, 0.32), rgba(0, 0, 0, 0) 45%);
}
.banner-logo {
  position: absolute;
  left: 64px;
  bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-family: "Segoe Script", "Comic Sans MS", cursive;
  font-size: 46px;
  font-weight: 700;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.35));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 1440px) {
  .left-entry__item.download {
    display: none;
  }
}
@media (max-width: 1280px) {
  .right-entry-text {
    display: none;
  }
  .right-entry__item {
    min-width: 40px;
  }
  .left-entry__item {
    margin-right: 14px;
  }
}
</style>
