<template>
  <div class="video-page" :class="{ 'light-off': lightOff }">
    <BiliHeader />

    <div class="video-container-v1" :class="{ wide }" :style="{ '--left-w': leftWidth + 'px' }">
      <!-- 标题信息 -->
      <div class="video-info-container">
        <h1 class="video-title" :title="video.title">{{ video.title }}</h1>
        <div class="video-info-detail">
          <span class="item"><Icon name="play-count" :size="18" :stroke="1.6" />{{ formatCount(video.view) }}</span>
          <span class="item"><Icon name="danmaku" :size="18" :stroke="1.6" />{{ formatCount(totalDm) }}</span>
          <span class="item pubdate">{{ formatFullDate(video.pubdate) }}</span>
          <span class="item copyright"><Icon name="report" :size="14" />未经作者授权，禁止转载</span>
        </div>
      </div>

      <!-- 播放器 -->
      <div class="player-wrap">
        <Player
          ref="playerRef"
          :src="src"
          :poster="video.cover"
          :danmaku-list="dmList"
          :online="video.online"
          :wide="wide"
          @meta="onMeta"
          @time="(t) => (curTime = t)"
          @send="onSendDm"
          @next="playNext"
          @wide="(w) => (wide = w)"
          @light="(l) => (lightOff = l)"
        />
      </div>

      <!-- 左侧：工具栏、简介、评论 -->
      <div class="left-container">
        <div class="video-toolbar-container">
          <div class="video-toolbar-left">
            <div
              class="toolbar-item video-like"
              :class="{ on: liked, triple: tripling }"
              @mousedown="startTriple"
              @mouseup="endTriple"
              @mouseleave="cancelTriple"
              title="点赞（长按可一键三连）"
            >
              <Icon name="like-fill" :size="28" />
              <span>{{ formatCount(video.like + (liked ? 1 : 0)) }}</span>
            </div>
            <div class="toolbar-item video-coin" :class="{ on: coins > 0, triple: tripling }" @click="coinDialog = true" title="投币">
              <Icon name="coin-fill" :size="28" />
              <span>{{ formatCount(video.coin + coins) }}</span>
            </div>
            <div class="toolbar-item video-fav" :class="{ on: faved, triple: tripling }" @click="favDialog = true" title="收藏">
              <Icon name="fav-fill" :size="28" />
              <span>{{ formatCount(video.favorite + (faved ? 1 : 0)) }}</span>
            </div>
            <div class="toolbar-item video-share">
              <Icon name="share-fill" :size="28" />
              <span>{{ formatCount(video.share) }}</span>
              <div class="share-panel">
                <div class="share-title">分享到</div>
                <div class="share-link">
                  <input :value="shareUrl" readonly />
                  <button class="btn-blue" @click="copyLink">复制链接</button>
                </div>
                <div class="share-platforms">
                  <span v-for="p in ['动态', '微信', 'QQ', '微博', 'QQ空间']" :key="p" @click="toast(`分享到${p}（演示）`)">
                    <i class="share-dot">{{ p[0] }}</i>{{ p }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="video-toolbar-right">
            <span class="right-item" @click="toast('举报功能为演示')"><Icon name="report" :size="16" />稿件投诉</span>
            <span class="right-item" @click="toast('笔记功能为演示')"><Icon name="note" :size="16" />记笔记</span>
            <span class="right-item"><Icon name="more" :size="16" /></span>
          </div>
        </div>

        <div class="video-desc-container">
          <div class="basic-desc-info" :class="{ open: descOpen }">{{ video.desc }}</div>
          <span class="toggle-btn" @click="descOpen = !descOpen">{{ descOpen ? '收起' : '展开更多' }}</span>
        </div>

        <div class="video-tag-container">
          <router-link class="tag-link category" :to="{ path: '/search', query: { keyword: video.category } }">
            <Icon name="grid" :size="14" />{{ video.category }}
          </router-link>
          <router-link v-for="t in video.tags" :key="t" class="tag-link" :to="{ path: '/search', query: { keyword: t } }">{{ t }}</router-link>
        </div>

        <CommentSection :bvid="video.bvid" :count="video.reply" :up-mid="video.owner.mid" />
      </div>

      <!-- 右侧：UP 主、弹幕列表、推荐 -->
      <div class="right-container">
        <div class="up-panel-container">
          <router-link :to="`/space/${up.mid}`" class="up-avatar-wrap">
            <img :src="up.face" alt="" class="up-avatar" />
            <span v-if="up.official" class="official-icon"><Icon name="check" :size="9" :stroke="3.5" /></span>
          </router-link>
          <div class="up-info--right">
            <div class="up-info__detail">
              <router-link :to="`/space/${up.mid}`" class="up-name" :class="{ vip: up.vip }">{{ up.name }}</router-link>
              <a class="send-msg" @click="toast('私信功能为演示')"><Icon name="mail" :size="16" />发消息</a>
            </div>
            <div class="up-description ellipsis" :title="up.sign">{{ up.official || up.sign }}</div>
            <div class="upinfo-btn-panel">
              <button class="charge-btn" @click="toast('感谢充电支持！（演示）')"><Icon name="charge" :size="16" />充电</button>
              <button class="follow-btn" :class="{ following }" @click="toggleFollow">
                <template v-if="following">已关注 {{ formatCount(up.fans + 1) }}</template>
                <template v-else><Icon name="plus" :size="14" :stroke="2.4" /> 关注 {{ formatCount(up.fans) }}</template>
              </button>
            </div>
          </div>
        </div>

        <div class="danmaku-box" :class="{ open: dmBoxOpen }">
          <div class="danmaku-header" @click="dmBoxOpen = !dmBoxOpen">
            <span class="dm-title">弹幕列表</span>
            <span class="dm-header-right">
              <Icon name="more" :size="16" />
              <Icon :name="dmBoxOpen ? 'chevron-up' : 'chevron-down'" :size="16" :stroke="2" />
            </span>
          </div>
          <div v-if="dmBoxOpen" class="danmaku-list">
            <div class="dm-row head">
              <span class="c-time">时间</span>
              <span class="c-text">弹幕内容</span>
              <span class="c-date">发送时间</span>
            </div>
            <div class="dm-scroll">
              <div
                v-for="d in sortedDm"
                :key="d.id"
                class="dm-row"
                :class="{ cur: Math.abs(d.time - curTime) < 1 }"
                @click="playerRef.seek(d.time)"
              >
                <span class="c-time">{{ formatDuration(d.time) }}</span>
                <span class="c-text ellipsis" :title="d.text">{{ d.text }}</span>
                <span class="c-date">{{ formatFullDate(d.sendTime).slice(5, 16) }}</span>
              </div>
              <div v-if="!sortedDm.length" class="dm-empty">视频加载后显示弹幕</div>
            </div>
          </div>
        </div>

        <a class="ad-report" @click="toast('活动推广（演示）')">
          <LazyImg :src="adImg" class="ad-img" />
          <span class="ad-tag">广告</span>
        </a>

        <div class="recommend-list-v1">
          <div class="next-play">
            <p class="rec-title">
              接下来播放
              <span class="auto-play" @click="autoPlay = !autoPlay">
                自动连播
                <i class="switch" :class="{ on: autoPlay }"><b></b></i>
              </span>
            </p>
            <RecCard :v="related[0]" />
          </div>
          <div class="split-line"></div>
          <RecCard v-for="v in related.slice(1, recShow)" :key="v.bvid" :v="v" />
          <div v-if="recShow < related.length" class="rec-footer" @click="recShow = related.length">展开</div>
        </div>
      </div>
    </div>

    <!-- 投币弹窗 -->
    <div v-if="coinDialog" class="bili-dialog-mask" @click.self="coinDialog = false">
      <div class="bili-dialog coin-dialog">
        <span class="dialog-close" @click="coinDialog = false"><Icon name="close" :size="18" /></span>
        <div class="coin-title">给UP主投上<span>{{ coinChoice }}</span>枚硬币</div>
        <div class="coin-options">
          <div v-for="n in [1, 2]" :key="n" class="coin-option" :class="{ active: coinChoice === n }" @click="coinChoice = n">
            <div class="coin-pics">
              <Icon v-for="k in n" :key="k" name="coin-fill" :size="56" />
            </div>
            <span>{{ n }}硬币</span>
          </div>
        </div>
        <label class="coin-like"><input type="checkbox" v-model="coinLike" /> 同时点赞内容</label>
        <button class="btn-blue dialog-btn" @click="doCoin">确定</button>
        <p class="coin-tip">经验值+{{ coinChoice * 10 }}（今日已获得 {{ coins * 10 }}/50）</p>
      </div>
    </div>

    <!-- 收藏弹窗 -->
    <div v-if="favDialog" class="bili-dialog-mask" @click.self="favDialog = false">
      <div class="bili-dialog fav-dialog">
        <span class="dialog-close" @click="favDialog = false"><Icon name="close" :size="18" /></span>
        <div class="fav-title">添加到收藏夹</div>
        <div class="fav-list">
          <label v-for="f in favFolders" :key="f.name" class="fav-item">
            <input type="checkbox" v-model="f.checked" />
            <span class="fav-name">{{ f.name }}</span>
            <span class="fav-count">{{ f.count }}</span>
          </label>
          <div class="fav-new" @click="addFolder"><Icon name="plus" :size="14" /> 新建收藏夹</div>
        </div>
        <button class="btn-blue dialog-btn" @click="doFav">确定</button>
      </div>
    </div>

    <div v-if="lightOff" class="light-mask" @click="lightOff = false"></div>
    <PaletteButtons />
  </div>
</template>

<script setup>
import { ref, computed, reactive, defineComponent, h, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import BiliHeader from '../components/BiliHeader.vue'
import Player from '../components/Player.vue'
import CommentSection from '../components/CommentSection.vue'
import Icon from '../components/Icon.vue'
import LazyImg from '../components/LazyImg.vue'
import PaletteButtons from '../components/PaletteButtons.vue'
import { getVideo, getRelated, getDanmakuList, formatCount, formatDuration, formatFullDate, SAMPLE_SOURCES, img } from '../data/mock'
import { toast } from '../utils/toast'

const route = useRoute()
const router = useRouter()
const video = getVideo(route.params.bvid)
const up = video.owner
const related = getRelated(video.bvid, 24)
const src = SAMPLE_SOURCES[video.idx % SAMPLE_SOURCES.length]
const adImg = img('ad-' + (video.idx % 5), 700, 196)
const shareUrl = `${location.origin}/video/${video.bvid}`
document.title = `${video.title}_哔哩哔哩_bilibili`

const playerRef = ref(null)
const curTime = ref(0)
const dmList = ref([])
const sentList = ref([])
const totalDm = computed(() => video.danmaku + sentList.value.length)
function onMeta(d) {
  if (!dmList.value.length) dmList.value = getDanmakuList(video.bvid, d)
}
// 自己发的弹幕已由播放器直接上屏，这里只记入右侧弹幕列表
const onSendDm = (d) => sentList.value.push(d)
const sortedDm = computed(() => [...dmList.value, ...sentList.value].sort((a, b) => a.time - b.time))

// 播放器宽度跟随视口计算，保证一屏内能看全（与 B 站一致）
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)
const wide = ref(false)
const lightOff = ref(false)
const leftWidth = computed(() => {
  const byHeight = ((vh.value - 64 - 104 - 56 - 30) * 16) / 9
  const byWidth = vw.value - 350 - 30 - 2 * 60
  return Math.round(Math.max(668, Math.min(byHeight, byWidth, 1400)))
})
const onResize = () => {
  vw.value = window.innerWidth
  vh.value = window.innerHeight
}
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

// 点赞 / 投币 / 收藏 / 长按三连
const liked = ref(false)
const coins = ref(0)
const faved = ref(false)
const tripling = ref(false)
let pressTimer = null
let longPressed = false
let pressing = false
function startTriple() {
  pressing = true
  longPressed = false
  tripling.value = true
  pressTimer = setTimeout(() => {
    longPressed = true
    tripling.value = false
    liked.value = true
    coins.value = Math.max(coins.value, 2)
    faved.value = true
    toast('三连成功！点赞 + 投币 + 收藏')
  }, 1200)
}
function endTriple() {
  if (!pressing) return
  pressing = false
  clearTimeout(pressTimer)
  tripling.value = false
  if (!longPressed) {
    liked.value = !liked.value
    toast(liked.value ? '点赞成功' : '已取消点赞')
  }
}
function cancelTriple() {
  pressing = false
  clearTimeout(pressTimer)
  tripling.value = false
}

const coinDialog = ref(false)
const coinChoice = ref(1)
const coinLike = ref(true)
function doCoin() {
  coinDialog.value = false
  if (coins.value >= 2) return toast('本视频已经投满 2 枚硬币啦')
  coins.value = Math.min(2, coins.value + coinChoice.value)
  if (coinLike.value) liked.value = true
  toast(`投币成功，经验值 +${coinChoice.value * 10}`)
}

const favDialog = ref(false)
const favFolders = reactive([
  { name: '默认收藏夹', count: 128, checked: false },
  { name: '稍后学习', count: 42, checked: false },
  { name: '好听的歌', count: 77, checked: false },
  { name: '美食教程', count: 19, checked: false },
])
function addFolder() {
  favFolders.push({ name: '新建收藏夹' + (favFolders.length - 3), count: 0, checked: true })
}
function doFav() {
  faved.value = favFolders.some((f) => f.checked)
  favDialog.value = false
  toast(faved.value ? '收藏成功' : '已取消收藏')
}

const following = ref(false)
function toggleFollow() {
  following.value = !following.value
  toast(following.value ? '关注成功' : '已取消关注')
}

function copyLink() {
  const text = `【${video.title}】 ${shareUrl}`
  if (!navigator.clipboard) return toast('复制失败，请手动复制')
  navigator.clipboard.writeText(text).then(
    () => toast('链接已复制到剪贴板'),
    () => toast('复制失败，请手动复制')
  )
}

const descOpen = ref(false)
const dmBoxOpen = ref(false)
const autoPlay = ref(true)
const recShow = ref(11)

function playNext() {
  router.push(`/video/${related[0].bvid}`)
}

// 右侧推荐小卡片
const RecCard = defineComponent({
  props: { v: Object },
  setup(p) {
    return () =>
      h('div', { class: 'video-page-card-small' }, [
        h(RouterLink, { to: `/video/${p.v.bvid}`, class: 'pic-box' }, () => [
          h(LazyImg, { src: p.v.cover, class: 'rec-cover' }),
          h('span', { class: 'duration' }, formatDuration(p.v.duration)),
        ]),
        h('div', { class: 'info' }, [
          h(RouterLink, { to: `/video/${p.v.bvid}`, class: 'title clamp-2', title: p.v.title }, () => p.v.title),
          h(RouterLink, { to: `/space/${p.v.owner.mid}`, class: 'upname' }, () => [
            h(Icon, { name: 'up', size: 16, stroke: 1.5 }),
            h('span', { class: 'ellipsis' }, p.v.owner.name),
          ]),
          h('div', { class: 'playinfo' }, [
            h(Icon, { name: 'play-count', size: 16, stroke: 1.5 }),
            formatCount(p.v.view),
            h(Icon, { name: 'danmaku', size: 16, stroke: 1.5, style: 'margin-left:12px' }),
            formatCount(p.v.danmaku),
          ]),
        ]),
      ])
  },
})
</script>

<style scoped>
.video-container-v1 {
  display: grid;
  grid-template-columns: var(--left-w) 350px;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    'info right'
    'player right'
    'left right';
  column-gap: 30px;
  justify-content: center;
  padding: 0 10px;
  margin: 0 auto;
}
.video-container-v1.wide {
  grid-template-areas:
    'info info'
    'player player'
    'left right';
}
.video-info-container {
  grid-area: info;
  padding-top: 22px;
  height: 104px;
  min-width: 0;
}
.player-wrap {
  grid-area: player;
  position: relative;
  z-index: 2;
}
.left-container {
  grid-area: left;
  min-width: 0;
}
.right-container {
  grid-area: right;
  min-width: 0;
  padding-top: 22px;
}
.wide .right-container {
  padding-top: 0;
}

/* 标题 */
.video-title {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  color: var(--text1);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}
.video-info-detail {
  display: flex;
  align-items: center;
  height: 24px;
  font-size: 13px;
  color: var(--text3);
  white-space: nowrap;
  overflow: hidden;
}
.video-info-detail .item {
  display: flex;
  align-items: center;
  margin-right: 12px;
}
.video-info-detail .item .bili-icon {
  margin-right: 3px;
}

/* 工具栏 */
.video-toolbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0 12px;
  border-bottom: 1px solid var(--line_regular);
}
.video-toolbar-left {
  display: flex;
  align-items: center;
}
.toolbar-item {
  position: relative;
  display: flex;
  align-items: center;
  width: 92px;
  margin-right: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text2);
  cursor: pointer;
  user-select: none;
  transition: color 0.3s;
}
.toolbar-item .bili-icon {
  margin-right: 8px;
  transition: transform 0.3s;
}
.toolbar-item:hover,
.toolbar-item.on {
  color: var(--brand_blue);
}
.toolbar-item.triple > .bili-icon {
  animation: triplePulse 1.2s linear forwards;
  color: var(--brand_blue);
}
@keyframes triplePulse {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(0.85);
  }
  100% {
    transform: scale(1.2);
  }
}
.share-panel {
  display: none;
  position: absolute;
  top: 36px;
  left: -60px;
  width: 300px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  color: var(--text1);
  font-weight: 400;
  cursor: default;
  z-index: 50;
}
.share-panel::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 0;
  right: 0;
  height: 12px;
}
.video-share:hover .share-panel {
  display: block;
}
.share-title {
  font-size: 14px;
  margin-bottom: 10px;
}
.share-link {
  display: flex;
  margin-bottom: 14px;
}
.share-link input {
  flex: 1;
  min-width: 0;
  height: 30px;
  padding: 0 8px;
  background: var(--graph_bg_regular);
  border-radius: 6px 0 0 6px;
  font-size: 12px;
  color: var(--text2);
}
.share-link button {
  padding: 0 10px;
  border-radius: 0 6px 6px 0;
  font-size: 12px;
}
.share-platforms {
  display: flex;
  justify-content: space-between;
}
.share-platforms span {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
}
.share-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--graph_bg_regular);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  font-style: normal;
  font-size: 14px;
}
.share-platforms span:hover .share-dot {
  background: var(--brand_blue_thin);
  color: var(--brand_blue);
}
.video-toolbar-right {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--text3);
  font-size: 13px;
}
.right-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.right-item:hover {
  color: var(--brand_blue);
}

/* 简介 */
.video-desc-container {
  margin: 16px 0;
}
.basic-desc-info {
  font-size: 15px;
  line-height: 24px;
  color: var(--text1);
  white-space: pre-line;
  max-height: 72px;
  overflow: hidden;
}
.basic-desc-info.open {
  max-height: none;
}
.toggle-btn {
  display: inline-block;
  margin-top: 10px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
}
.toggle-btn:hover {
  color: var(--brand_blue);
}
.video-tag-container {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--line_regular);
}
.tag-link {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  margin: 0 12px 8px 0;
  border-radius: 14px;
  background: var(--graph_bg_regular);
  font-size: 13px;
  color: var(--text2);
  transition: all 0.2s;
}
.tag-link:hover {
  color: var(--brand_blue);
  background: var(--brand_blue_thin);
}
.tag-link.category {
  color: var(--brand_blue);
}

/* 右侧 UP */
.up-panel-container {
  display: flex;
  height: 104px;
}
.wide .up-panel-container {
  margin-top: 22px;
}
.up-avatar-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  margin-right: 12px;
  flex-shrink: 0;
}
.up-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_regular);
}
.official-icon {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #ffc62e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.up-info--right {
  flex: 1;
  min-width: 0;
}
.up-info__detail {
  display: flex;
  align-items: center;
  height: 22px;
}
.up-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text1);
  margin-right: 12px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.up-name.vip {
  color: var(--brand_pink);
}
.up-name:hover {
  color: var(--brand_blue);
}
.send-msg {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: var(--text2);
  cursor: pointer;
}
.send-msg:hover {
  color: var(--brand_blue);
}
.up-description {
  margin-top: 2px;
  font-size: 13px;
  line-height: 16px;
  height: 16px;
  color: var(--text3);
}
.upinfo-btn-panel {
  display: flex;
  margin-top: 6px;
}
.charge-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 104px;
  height: 30px;
  border: 1px solid var(--brand_pink);
  border-radius: 6px;
  color: var(--brand_pink);
  font-size: 14px;
  flex-shrink: 0;
  transition: background 0.2s;
}
.charge-btn:hover {
  background: var(--brand_pink_thin);
}
.follow-btn {
  flex: 1;
  margin-left: 12px;
  height: 30px;
  border-radius: 6px;
  background: var(--brand_blue);
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  transition: background 0.2s;
  white-space: nowrap;
}
.follow-btn:hover {
  background: #40c5f1;
}
.follow-btn.following {
  background: var(--graph_bg_thick);
  color: var(--text2);
}

/* 弹幕列表 */
.danmaku-box {
  margin-bottom: 18px;
  border-radius: 6px;
  background: var(--graph_bg_regular);
  overflow: hidden;
}
.danmaku-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 16px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--text1);
}
.dm-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text2);
}
.danmaku-list {
  background: #fff;
  border: 1px solid var(--graph_bg_regular);
  border-top: none;
  border-radius: 0 0 6px 6px;
}
.dm-row {
  display: flex;
  height: 24px;
  line-height: 24px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--text2);
  cursor: pointer;
}
.dm-row:not(.head):hover {
  background: var(--graph_bg_regular);
}
.dm-row.head {
  height: 30px;
  line-height: 30px;
  color: var(--text3);
  cursor: default;
}
.dm-row.cur {
  color: var(--brand_blue);
}
.c-time {
  width: 52px;
  flex-shrink: 0;
}
.c-text {
  flex: 1;
  min-width: 0;
}
.c-date {
  width: 84px;
  text-align: right;
  flex-shrink: 0;
}
.dm-scroll {
  max-height: 340px;
  overflow-y: auto;
}
.dm-empty {
  padding: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text3);
}

/* 广告位 */
.ad-report {
  position: relative;
  display: block;
  margin-bottom: 18px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}
.ad-img {
  width: 100%;
  aspect-ratio: 350 / 98;
}
.ad-tag {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 0 4px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  border-radius: 2px;
  font-size: 10px;
  line-height: 16px;
}

/* 推荐 */
.rec-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text1);
}
.auto-play {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 400;
  color: var(--text2);
  cursor: pointer;
}
.switch {
  position: relative;
  width: 30px;
  height: 16px;
  border-radius: 8px;
  background: var(--graph_bg_thick);
  transition: background 0.2s;
}
.switch b {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}
.switch.on {
  background: var(--brand_blue);
}
.switch.on b {
  left: 16px;
}
.split-line {
  height: 1px;
  background: var(--line_regular);
  margin: 6px 0 18px;
}
:deep(.video-page-card-small) {
  display: flex;
  margin-bottom: 12px;
}
:deep(.pic-box) {
  position: relative;
  width: 141px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 10px;
}
:deep(.rec-cover) {
  width: 100%;
  height: 100%;
}
:deep(.pic-box .duration) {
  position: absolute;
  right: 6px;
  bottom: 6px;
  padding: 0 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 12px;
  line-height: 17px;
}
:deep(.video-page-card-small .info) {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
:deep(.video-page-card-small .title) {
  font-size: 15px;
  font-weight: 500;
  line-height: 19px;
  color: var(--text1);
  margin-bottom: 4px;
  transition: color 0.2s;
}
:deep(.video-page-card-small .title:hover) {
  color: var(--brand_blue);
}
:deep(.upname),
:deep(.playinfo) {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  line-height: 18px;
  color: var(--text3);
  min-width: 0;
}
:deep(.upname:hover) {
  color: var(--brand_blue);
}
:deep(.playinfo) {
  margin-top: auto;
}
.rec-footer {
  height: 30px;
  line-height: 30px;
  margin: 18px 0 30px;
  border-radius: 6px;
  background: var(--graph_bg_regular);
  text-align: center;
  font-size: 12px;
  color: var(--text1);
  cursor: pointer;
}
.rec-footer:hover {
  background: var(--graph_bg_thick);
}

/* 弹窗 */
.bili-dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bili-dialog {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 26px 30px 24px;
  animation: dialogIn 0.2s ease;
}
@keyframes dialogIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
}
.dialog-close {
  position: absolute;
  right: 16px;
  top: 16px;
  color: var(--text3);
  cursor: pointer;
  display: flex;
}
.dialog-close:hover {
  color: var(--brand_blue);
}
.coin-dialog {
  width: 520px;
  text-align: center;
}
.coin-title {
  font-size: 16px;
  margin-bottom: 26px;
}
.coin-title span {
  color: var(--brand_blue);
  font-size: 20px;
  margin: 0 4px;
}
.coin-options {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 20px;
}
.coin-option {
  width: 168px;
  height: 160px;
  border: 2px dashed var(--line_regular);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--gold);
  cursor: pointer;
  font-size: 13px;
}
.coin-option span {
  color: var(--text2);
}
.coin-option.active {
  border: 2px solid var(--brand_blue);
}
.coin-pics {
  display: flex;
  gap: 4px;
}
.coin-like {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text2);
  margin-bottom: 16px;
  cursor: pointer;
}
.coin-like input,
.fav-item input {
  accent-color: var(--brand_blue);
}
.dialog-btn {
  display: block;
  width: 160px;
  height: 40px;
  margin: 0 auto;
  font-size: 14px;
}
.coin-tip {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text3);
}
.fav-dialog {
  width: 420px;
}
.fav-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}
.fav-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}
.fav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 6px;
  border-radius: 6px;
  cursor: pointer;
}
.fav-item:hover {
  background: var(--graph_bg_regular);
}
.fav-name {
  flex: 1;
  font-size: 14px;
}
.fav-count {
  font-size: 12px;
  color: var(--text3);
}
.fav-new {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 6px;
  font-size: 14px;
  color: var(--text2);
  cursor: pointer;
}
.fav-new:hover {
  color: var(--brand_blue);
}
.light-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1;
}
</style>
