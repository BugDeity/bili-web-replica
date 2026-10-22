<template>
  <div class="bili-home">
    <BiliHeader banner />

    <!-- 频道导航 -->
    <div class="bili-header__channel" ref="channelRef">
      <div class="channel-icons">
        <a class="channel-icons__item" @click="toast('动态页为演示入口')">
          <div class="icon-bg icon-bg__dynamic"><Icon name="dynamic" :size="24" :stroke="2" /></div>
          <span class="icon-title">动态</span>
        </a>
        <router-link to="/popular" class="channel-icons__item">
          <div class="icon-bg icon-bg__popular"><Icon name="fire" :size="24" /></div>
          <span class="icon-title">热门</span>
        </router-link>
      </div>
      <div class="right-channel-container">
        <div class="channel-items__left">
          <router-link
            v-for="c in CHANNELS_LEFT"
            :key="c"
            :to="{ path: '/search', query: { keyword: c } }"
            class="channel-link"
          >
            {{ c }}<Icon v-if="c === '更多'" name="chevron-down" :size="12" :stroke="2.4" class="more-arrow" />
          </router-link>
        </div>
        <span class="divider"></span>
        <div class="channel-items__right">
          <a v-for="c in channelRight" :key="c.text" class="channel-entry-more__link" @click="toast(`「${c.text}」为演示入口`)">
            <Icon :name="c.icon" :size="18" />
            <span>{{ c.text }}</span>
          </a>
        </div>
      </div>
    </div>

    <!-- 吸顶的频道条 -->
    <transition name="slide">
      <div v-show="channelFixed" class="header-channel-fixed">
        <div class="fixed-inner">
          <router-link to="/popular" class="fixed-hot"><Icon name="fire" :size="16" />热门</router-link>
          <router-link
            v-for="c in CHANNELS_LEFT.slice(0, -1)"
            :key="c"
            :to="{ path: '/search', query: { keyword: c } }"
            class="fixed-link"
          >{{ c }}</router-link>
        </div>
      </div>
    </transition>

    <!-- 推荐流 -->
    <main class="bili-feed4">
      <div class="feed-container" :style="{ '--cols': cols }">
        <div class="recommended-container">
          <Carousel />
          <VideoCard v-for="v in firstBatch" :key="'f' + v.bvid" :video="v" class="fade-in" />
        </div>
        <button class="feed-roll-btn" @click="roll">
          <Icon name="refresh" :size="18" :stroke="2" class="roll-icon" :style="{ transform: `rotate(${rollDeg}deg)` }" />
          <span>换一换</span>
        </button>

        <div class="feed-more">
          <template v-for="(item, i) in moreList" :key="i">
            <div v-if="item.type === 'live'" class="live-card">
              <a class="card-image" @click="toast('直播间为演示入口')">
                <LazyImg :src="item.cover" class="cover" />
                <span class="live-badge"><i class="live-wave"><b></b><b></b><b></b></i>直播中</span>
                <div class="live-mask">
                  <span>{{ item.area }}</span>
                  <span><Icon name="eye" :size="15" />{{ formatCount(item.online) }}人看过</span>
                </div>
              </a>
              <div class="live-info">
                <h3 class="live-title clamp-2">{{ item.title }}</h3>
                <router-link :to="`/space/${item.owner.mid}`" class="live-owner">
                  <span class="live-tag">直播</span><span class="ellipsis">{{ item.owner.name }}</span>
                </router-link>
              </div>
            </div>
            <VideoCard v-else :video="item" />
          </template>
          <template v-if="loading">
            <div v-for="n in cols * 2" :key="'sk' + n" class="skeleton">
              <div class="sk-cover"></div>
              <div class="sk-line"></div>
              <div class="sk-line short"></div>
            </div>
          </template>
        </div>
        <div ref="sentinel" class="load-more-sentinel"></div>
        <div v-if="page >= MAX_PAGE" class="no-more">已经到底啦，换一换看看吧~</div>
      </div>
    </main>

    <PaletteButtons refresh @refresh="refreshAll" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import BiliHeader from '../components/BiliHeader.vue'
import Carousel from '../components/Carousel.vue'
import VideoCard from '../components/VideoCard.vue'
import Icon from '../components/Icon.vue'
import LazyImg from '../components/LazyImg.vue'
import PaletteButtons from '../components/PaletteButtons.vue'
import { CHANNELS_LEFT, shuffleFeed, getFeed, getLiveCards, formatCount } from '../data/mock'
import { toast } from '../utils/toast'

const channelRight = [
  { text: '专栏', icon: 'article' },
  { text: '活动', icon: 'flag' },
  { text: '社区中心', icon: 'community' },
  { text: '直播', icon: 'live' },
  { text: '课堂', icon: 'course' },
  { text: '新歌热榜', icon: 'music' },
]

// 根据窗口宽度决定列数（与 B 站一致：4 / 5 / 6 列）
const width = ref(window.innerWidth)
const cols = computed(() => (width.value < 1400 ? 4 : width.value < 1940 ? 5 : 6))
const firstCount = computed(() => (cols.value - 2) * 2 + cols.value)

const rollSeed = ref(0)
const rollDeg = ref(0)
const firstBatch = computed(() => shuffleFeed(rollSeed.value, 14).slice(0, firstCount.value))
function roll() {
  rollSeed.value++
  rollDeg.value += 360
}

// 无限滚动
const MAX_PAGE = 30
const page = ref(0)
const moreList = ref([])
const loading = ref(false)
function loadMore() {
  if (loading.value || page.value >= MAX_PAGE) return
  loading.value = true
  setTimeout(() => {
    const size = cols.value * 2
    const items = getFeed(page.value + 3, size)
    if (page.value % 3 === 1) items.splice(Math.min(size - 1, 3), 1, getLiveCards(page.value))
    moreList.value.push(...items)
    page.value++
    loading.value = false
  }, 350)
}

function refreshAll() {
  roll()
  moreList.value = []
  page.value = 0
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadMore()
}

// 吸顶频道条
const channelRef = ref(null)
const channelFixed = ref(false)
function onScroll() {
  const el = channelRef.value
  if (el) channelFixed.value = el.getBoundingClientRect().bottom < 64
  // IntersectionObserver 的兜底：滚动接近底部时也触发加载
  if (sentinel.value && sentinel.value.getBoundingClientRect().top < window.innerHeight + 600) loadMore()
}
const onResize = () => (width.value = window.innerWidth)

const sentinel = ref(null)
let io = null
onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  io = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), { rootMargin: '600px' })
  io.observe(sentinel.value)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  io && io.disconnect()
})
</script>

<style scoped>
.bili-home {
  padding-bottom: 40px;
}

/* 频道 */
.bili-header__channel {
  display: flex;
  align-items: center;
  max-width: 2560px;
  margin: 0 auto;
  padding: 20px 64px 0;
  height: auto;
}
.channel-icons {
  display: flex;
  margin-right: 12px;
  flex-shrink: 0;
}
.channel-icons__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 46px;
  margin-right: 20px;
  cursor: pointer;
}
.icon-bg {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  margin-bottom: 4px;
  transition: transform 0.2s;
}
.channel-icons__item:hover .icon-bg {
  transform: scale(1.05);
}
.icon-bg__dynamic {
  background: #ff9212;
}
.icon-bg__popular {
  background: #f07775;
}
.icon-title {
  font-size: 13px;
  color: var(--text1);
  white-space: nowrap;
}
.right-channel-container {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}
.channel-items__left {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(11, minmax(56px, 1fr));
  grid-auto-rows: 30px;
  gap: 12px 11px;
  min-width: 0;
}
.channel-link {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  border-radius: 6px;
  background: var(--bg2);
  border: 1px solid var(--line_light);
  font-size: 14px;
  color: var(--text1);
  white-space: nowrap;
  transition: background 0.2s;
}
.channel-link:hover {
  background: var(--graph_bg_thick);
}
.more-arrow {
  margin-left: 2px;
}
.divider {
  width: 1px;
  height: 72px;
  margin: 0 20px;
  background: var(--line_regular);
  flex-shrink: 0;
}
.channel-items__right {
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-auto-rows: 30px;
  gap: 12px 16px;
  flex-shrink: 0;
}
.channel-entry-more__link {
  display: flex;
  align-items: center;
  height: 30px;
  font-size: 14px;
  color: var(--text1);
  white-space: nowrap;
  cursor: pointer;
}
.channel-entry-more__link .bili-icon {
  margin-right: 4px;
  color: var(--text2);
}
.channel-entry-more__link:hover {
  color: var(--brand_blue);
}
.channel-entry-more__link:hover .bili-icon {
  color: var(--brand_blue);
}

/* 吸顶频道 */
.header-channel-fixed {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  z-index: 1001;
  height: 50px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  border-top: 1px solid var(--line_light);
}
.fixed-inner {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 64px;
  gap: 8px;
  overflow: hidden;
}
.fixed-hot {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  color: #fff;
  background: #f07775;
  flex-shrink: 0;
  margin-right: 8px;
}
.fixed-link {
  flex-shrink: 0;
  height: 30px;
  line-height: 30px;
  padding: 0 12px;
  border-radius: 6px;
  font-size: 14px;
  background: var(--bg2);
}
.fixed-link:hover {
  background: var(--graph_bg_thick);
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s, opacity 0.25s;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-50px);
  opacity: 0;
}

/* 推荐流 */
.bili-feed4 {
  max-width: 2560px;
  margin: 0 auto;
  padding: 20px 64px 0;
}
.feed-container {
  position: relative;
}
.recommended-container,
.feed-more {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 20px;
  row-gap: 24px;
}
.feed-more {
  margin-top: 24px;
}
.fade-in {
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0.2;
  }
}
.feed-roll-btn {
  position: absolute;
  top: 0;
  right: -52px;
  width: 40px;
  padding: 9px 0 10px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: var(--text1);
  transition: background 0.2s;
}
.feed-roll-btn:hover {
  background: var(--graph_bg_thick);
}
.feed-roll-btn span {
  margin-top: 4px;
  writing-mode: vertical-lr;
  letter-spacing: 1px;
}
.roll-icon {
  transition: transform 0.6s ease;
}

/* 直播卡片 */
.live-card .card-image {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
}
.live-card .cover {
  width: 100%;
  height: 100%;
}
.live-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 12px;
}
.live-wave {
  display: flex;
  align-items: flex-end;
  gap: 1.5px;
  height: 9px;
  margin-right: 4px;
}
.live-wave b {
  width: 2px;
  background: #fff;
  border-radius: 1px;
  animation: wave 0.8s infinite ease-in-out;
}
.live-wave b:nth-child(2) {
  animation-delay: 0.2s;
}
.live-wave b:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes wave {
  0%,
  100% {
    height: 3px;
  }
  50% {
    height: 9px;
  }
}
.live-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 38px;
  padding: 16px 8px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #fff;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
}
.live-mask span {
  display: flex;
  align-items: center;
  gap: 2px;
}
.live-info {
  padding-top: 12px;
}
.live-title {
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  min-height: 44px;
  margin-bottom: 4px;
}
.live-owner {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--text3);
}
.live-owner:hover {
  color: var(--brand_blue);
}
.live-tag {
  flex-shrink: 0;
  margin-right: 6px;
  padding: 0 4px;
  border: 1px solid var(--brand_pink);
  border-radius: 3px;
  font-size: 11px;
  line-height: 15px;
  color: var(--brand_pink);
}

/* 骨架屏 */
.skeleton .sk-cover {
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  background: var(--graph_bg_regular);
}
.sk-line {
  height: 18px;
  margin-top: 12px;
  border-radius: 4px;
  background: var(--graph_bg_regular);
}
.sk-line.short {
  width: 50%;
  margin-top: 8px;
}
.load-more-sentinel {
  height: 1px;
}
.no-more {
  padding: 30px 0 10px;
  text-align: center;
  font-size: 13px;
  color: var(--text3);
}

@media (max-width: 1400px) {
  .bili-header__channel,
  .bili-feed4 {
    padding-left: 32px;
    padding-right: 64px;
  }
  .channel-items__left {
    grid-template-columns: repeat(11, minmax(48px, 1fr));
    gap: 12px 8px;
  }
  .channel-link {
    font-size: 13px;
  }
}
@media (max-width: 1240px) {
  .channel-items__right {
    display: none;
  }
  .divider {
    display: none;
  }
}
</style>
