<template>
  <div class="bpx-player-container" :class="{ 'web-full': webFull, 'is-full': isFull }" ref="containerRef">
    <div
      class="bpx-player-primary-area"
      :class="{ 'hide-cursor': !controlsVisible && playing }"
      @mousemove="showControls"
      @mouseleave="hideControlsSoon(0)"
    >
      <div class="bpx-player-video-area" @click="onVideoClick" @dblclick="toggleFull">
        <video
          ref="videoRef"
          class="bpx-player-video"
          :src="src"
          :poster="poster"
          preload="metadata"
          playsinline
          @loadedmetadata="onMeta"
          @timeupdate="onTimeUpdate"
          @progress="onProgress"
          @play="onPlay"
          @pause="onPause"
          @waiting="waiting = true"
          @playing="waiting = false"
          @canplay="waiting = false"
          @ended="onEnded"
          @error="error = true"
          @volumechange="syncVolume"
        ></video>

        <!-- 弹幕层 -->
        <div
          ref="dmLayerRef"
          class="bpx-player-row-dm-wrap"
          :class="{ paused: !playing, hidden: !dmOn }"
          :style="{ opacity: dmOpacity }"
        >
          <span
            v-for="d in activeDm"
            :key="d.key"
            class="dm"
            :class="[d.mode === 'top' ? 'dm-top' : 'dm-scroll', { 'dm-self': d.self }]"
            :style="dmStyle(d)"
            @animationend="removeDm(d.key)"
          >{{ d.text }}</span>
        </div>

        <!-- 加载 / 错误 / 暂停态 -->
        <div v-if="waiting && !error" class="bpx-player-loading">
          <div class="loading-tv"><Icon name="tv" :size="46" :stroke="2" /></div>
          <span>正在缓冲...</span>
        </div>
        <div v-if="error" class="bpx-player-error">
          <Icon name="tv" :size="56" :stroke="1.6" />
          <p>视频加载失败，请检查网络后重试</p>
          <button class="btn-blue retry" @click.stop="retry">重新加载</button>
        </div>
        <transition name="fade">
          <div v-if="!playing && !error && started" class="bpx-player-state-wrap">
            <Icon name="play" :size="64" />
          </div>
        </transition>
        <div v-if="!started && !error" class="bpx-player-start">
          <button class="start-btn" @click.stop="togglePlay"><Icon name="play" :size="34" /></button>
        </div>
        <transition name="fade">
          <div v-if="tip" class="bpx-player-tooltip">{{ tip }}</div>
        </transition>
        <div v-if="ended" class="bpx-player-ending" @click.stop>
          <p>视频播放完毕</p>
          <button class="replay" @click="replay"><Icon name="refresh" :size="20" />重新播放</button>
        </div>
      </div>

      <!-- 控制栏 -->
      <div class="bpx-player-control-wrap" :class="{ show: controlsVisible || !playing }" @mouseenter="hovering = true" @mouseleave="hovering = false">
        <div class="bpx-player-control-mask"></div>
        <div
          class="bpx-player-progress"
          ref="progressRef"
          @mousedown="startSeek"
          @mousemove="onProgressHover"
          @mouseleave="hoverTime = null"
        >
          <div class="progress-track">
            <div class="progress-buffer" :style="{ width: (buffered / (duration || 1)) * 100 + '%' }"></div>
            <div class="progress-played" :style="{ width: progress * 100 + '%' }"></div>
            <div class="progress-thumb" :style="{ left: progress * 100 + '%' }">
              <Icon name="tv" :size="18" :stroke="2.4" />
            </div>
          </div>
          <div v-if="hoverTime !== null" class="progress-preview" :style="{ left: hoverX + 'px' }">{{ formatDuration(hoverTime) }}</div>
        </div>
        <div class="bpx-player-control-bottom">
          <div class="control-left">
            <button class="ctrl-btn" @click="togglePlay" :title="playing ? '暂停 (space)' : '播放 (space)'">
              <Icon :name="playing ? 'pause' : 'play'" :size="22" />
            </button>
            <button class="ctrl-btn" @click="$emit('next')" title="下一个">
              <Icon name="next" :size="22" />
            </button>
            <div class="ctrl-time">
              <span>{{ formatDuration(currentTime) }}</span>
              <span class="divide">/</span>
              <span>{{ formatDuration(duration) }}</span>
            </div>
          </div>
          <div class="control-right">
            <div class="ctrl-menu">
              <button class="ctrl-text">{{ quality }}</button>
              <ul class="menu-list">
                <li v-for="q in qualities" :key="q" :class="{ active: q === quality }" @click="setQuality(q)">
                  {{ q }}<span v-if="q.includes('4K') || q.includes('1080P 60')" class="vip-mark">大会员</span>
                </li>
              </ul>
            </div>
            <div class="ctrl-menu">
              <button class="ctrl-text">{{ rate === 1 ? '倍速' : rate + 'x' }}</button>
              <ul class="menu-list">
                <li v-for="r in rates" :key="r" :class="{ active: r === rate }" @click="setRate(r)">{{ r % 1 ? r : r.toFixed(1) }}x</li>
              </ul>
            </div>
            <button class="ctrl-btn" title="字幕" @click="flash('当前视频暂无字幕')"><Icon name="subtitle" :size="22" :stroke="1.6" /></button>
            <div class="ctrl-menu volume-menu">
              <button class="ctrl-btn" @click="toggleMute" title="静音 (m)">
                <Icon :name="muted || volume === 0 ? 'mute' : 'volume'" :size="22" :stroke="1.6" />
              </button>
              <div class="volume-panel">
                <div class="volume-number">{{ muted ? 0 : Math.round(volume * 100) }}</div>
                <div class="volume-slider" ref="volRef" @mousedown="startVolume">
                  <div class="volume-track">
                    <div class="volume-fill" :style="{ height: (muted ? 0 : volume) * 100 + '%' }"></div>
                    <div class="volume-thumb" :style="{ bottom: (muted ? 0 : volume) * 100 + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="ctrl-menu setting-menu">
              <button class="ctrl-btn" title="设置"><Icon name="settings" :size="22" :stroke="1.6" /></button>
              <div class="setting-panel">
                <div class="setting-title">播放方式</div>
                <label class="setting-radio" v-for="m in ['自动切集', '播完暂停', '单集循环']" :key="m">
                  <input type="radio" :value="m" v-model="playMode" /> <span>{{ m }}</span>
                </label>
                <div class="setting-title">其他设置</div>
                <label class="setting-check"><input type="checkbox" v-model="mirror" /> <span>镜像画面</span></label>
                <label class="setting-check"><input type="checkbox" v-model="lightOff" @change="$emit('light', lightOff)" /> <span>关灯模式</span></label>
              </div>
            </div>
            <button class="ctrl-btn" title="画中画" @click="togglePip"><Icon name="pip" :size="22" :stroke="1.6" /></button>
            <button class="ctrl-btn" :class="{ on: wide }" title="宽屏模式 (t)" @click="toggleWide"><Icon name="widescreen" :size="22" :stroke="1.6" /></button>
            <button class="ctrl-btn" :class="{ on: webFull }" title="网页全屏 (esc 退出)" @click="toggleWebFull"><Icon name="webfull" :size="22" :stroke="1.6" /></button>
            <button class="ctrl-btn" title="进入全屏 (f)" @click="toggleFull"><Icon name="fullscreen" :size="22" :stroke="1.8" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹幕发送栏 -->
    <div class="bpx-player-sending-area">
      <div class="sending-info">
        <span class="online">{{ online }}</span> 人正在看，已装填 <span>{{ totalDm }}</span> 条弹幕
      </div>
      <div class="sending-bar">
        <button class="dm-switch" :class="{ off: !dmOn }" @click="toggleDm" :title="dmOn ? '关闭弹幕 (d)' : '开启弹幕 (d)'">
          <Icon :name="dmOn ? 'dm-on' : 'dm-off'" :size="24" :stroke="1.6" />
        </button>
        <div class="ctrl-menu dm-setting">
          <button class="dm-setting-btn" title="弹幕显示设置"><Icon name="dm-setting" :size="24" :stroke="1.6" /></button>
          <div class="dm-setting-panel">
            <div class="row">
              <span>不透明度</span>
              <input type="range" min="0.2" max="1" step="0.05" v-model.number="dmOpacity" />
              <span class="val">{{ Math.round(dmOpacity * 100) }}%</span>
            </div>
            <div class="row">
              <span>弹幕速度</span>
              <input type="range" min="5" max="14" step="1" v-model.number="dmSpeedRev" />
              <span class="val">{{ dmSpeedRev <= 7 ? '较快' : dmSpeedRev >= 11 ? '较慢' : '适中' }}</span>
            </div>
            <div class="row">
              <span>字体大小</span>
              <input type="range" min="0.6" max="1.4" step="0.05" v-model.number="dmScale" />
              <span class="val">{{ Math.round(dmScale * 100) }}%</span>
            </div>
          </div>
        </div>
        <div class="dm-input-wrap" :class="{ disabled: !dmOn }">
          <div class="ctrl-menu dm-color">
            <button class="color-btn" title="弹幕颜色"><i :style="{ background: dmColor }"></i></button>
            <div class="color-panel">
              <span v-for="c in dmColors" :key="c" :style="{ background: c }" :class="{ active: c === dmColor }" @click="dmColor = c"></span>
            </div>
          </div>
          <input
            v-model="dmText"
            class="dm-input"
            maxlength="100"
            :placeholder="dmOn ? '发个友善的弹幕见证当下' : '已关闭弹幕'"
            :disabled="!dmOn"
            @keydown.enter="sendDm"
            @keydown.stop
          />
          <a class="dm-hint" @click="flash('请遵守弹幕礼仪，友善发言哦~')">弹幕礼仪 <Icon name="chevron-right" :size="10" :stroke="2.4" /></a>
          <button class="dm-send" :disabled="!dmOn" @click="sendDm">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Icon from './Icon.vue'
import { formatDuration } from '../data/mock'
import { toast } from '../utils/toast'

const props = defineProps({
  src: String,
  poster: String,
  danmakuList: { type: Array, default: () => [] },
  online: { type: Number, default: 0 },
  wide: Boolean,
})
const emit = defineEmits(['meta', 'time', 'send', 'next', 'wide', 'light'])

const containerRef = ref(null)
const videoRef = ref(null)
const dmLayerRef = ref(null)
const progressRef = ref(null)
const volRef = ref(null)

const playing = ref(false)
const started = ref(false)
const ended = ref(false)
const waiting = ref(false)
const error = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const buffered = ref(0)
const volume = ref(0.7)
const muted = ref(false)
const rate = ref(1)
const rates = [2, 1.5, 1.25, 1, 0.75, 0.5]
const qualities = ['4K 超清', '1080P 60帧', '1080P 高清', '720P 准高清', '480P 清晰', '360P 流畅', '自动']
const quality = ref('1080P 高清')
const playMode = ref('播完暂停')
const mirror = ref(false)
const lightOff = ref(false)
const webFull = ref(false)
const isFull = ref(false)
const tip = ref('')

const progress = computed(() => (duration.value ? currentTime.value / duration.value : 0))

// ------- 播放控制 -------
function togglePlay() {
  const v = videoRef.value
  if (!v || error.value) return
  if (v.paused) {
    v.play().catch(() => {})
  } else v.pause()
}
function onVideoClick() {
  if (!error.value) togglePlay()
}
function onPlay() {
  playing.value = true
  started.value = true
  ended.value = false
  hideControlsSoon()
}
function onPause() {
  playing.value = false
}
function onEnded() {
  playing.value = false
  if (playMode.value === '单集循环') return replay()
  if (playMode.value === '自动切集') return emit('next')
  ended.value = true
}
function replay() {
  ended.value = false
  seek(0)
  videoRef.value.play()
}
function retry() {
  error.value = false
  videoRef.value.load()
}
// 媒体事件统一用 e.target，避免组件卸载后 ref 为空
function onMeta(e) {
  duration.value = e.target.duration
  e.target.volume = volume.value
  emit('meta', duration.value)
}
function onTimeUpdate(e) {
  currentTime.value = e.target.currentTime
  emit('time', currentTime.value)
}
function onProgress(e) {
  const v = e.target
  if (v.buffered.length) buffered.value = v.buffered.end(v.buffered.length - 1)
}
function seek(t) {
  const v = videoRef.value
  if (!v || !duration.value) return
  t = Math.max(0, Math.min(duration.value, t))
  v.currentTime = t
  currentTime.value = t
  resetDanmaku()
}

// 进度条拖拽
const hoverTime = ref(null)
const hoverX = ref(0)
function timeFromEvent(e) {
  const rect = progressRef.value.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  return { t: ratio * duration.value, x: ratio * rect.width }
}
function onProgressHover(e) {
  if (!duration.value) return
  const { t, x } = timeFromEvent(e)
  hoverTime.value = t
  hoverX.value = x
}
function startSeek(e) {
  if (!duration.value) return
  seek(timeFromEvent(e).t)
  const move = (ev) => seek(timeFromEvent(ev).t)
  const up = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', up)
  }
  document.addEventListener('mousemove', move)
  document.addEventListener('mouseup', up)
}

// 音量
function syncVolume(e) {
  volume.value = e.target.volume
  muted.value = e.target.muted
}
function setVolume(v) {
  const video = videoRef.value
  video.volume = Math.max(0, Math.min(1, v))
  video.muted = false
}
function toggleMute() {
  videoRef.value.muted = !videoRef.value.muted
}
function startVolume(e) {
  const calc = (ev) => {
    const rect = volRef.value.getBoundingClientRect()
    setVolume((rect.bottom - ev.clientY) / rect.height)
  }
  calc(e)
  const up = () => {
    document.removeEventListener('mousemove', calc)
    document.removeEventListener('mouseup', up)
  }
  document.addEventListener('mousemove', calc)
  document.addEventListener('mouseup', up)
}

function setRate(r) {
  rate.value = r
  videoRef.value.playbackRate = r
  flash(`已切换至 ${r} 倍速`)
}
function setQuality(q) {
  if (q.includes('4K') || q.includes('60帧')) return flash('该清晰度为大会员专享（演示）')
  quality.value = q
  flash(`已切换至 ${q}`)
}

function flash(msg) {
  tip.value = msg
  clearTimeout(flash.t)
  flash.t = setTimeout(() => (tip.value = ''), 1500)
}

// 全屏 / 网页全屏 / 宽屏 / 画中画
function toggleFull() {
  if (document.fullscreenElement) document.exitFullscreen()
  else containerRef.value.requestFullscreen?.()
}
const onFsChange = () => (isFull.value = !!document.fullscreenElement)
function toggleWebFull() {
  webFull.value = !webFull.value
  document.body.style.overflow = webFull.value ? 'hidden' : ''
  nextTick(resetDanmaku)
}
function toggleWide() {
  emit('wide', !props.wide)
  nextTick(resetDanmaku)
}
async function togglePip() {
  try {
    if (document.pictureInPictureElement) await document.exitPictureInPicture()
    else await videoRef.value.requestPictureInPicture()
  } catch {
    flash('当前浏览器不支持画中画')
  }
}

// 控制栏自动隐藏
const controlsVisible = ref(true)
const hovering = ref(false)
let hideTimer = null
function showControls() {
  controlsVisible.value = true
  hideControlsSoon()
}
function hideControlsSoon(ms = 2500) {
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (!hovering.value && playing.value) controlsVisible.value = false
  }, ms)
}

// ------- 弹幕 -------
const dmOn = ref(true)
const dmOpacity = ref(1)
const dmSpeedRev = ref(8) // 横穿屏幕所需秒数
const dmScale = ref(1)
const dmText = ref('')
const dmColor = ref('#ffffff')
const dmColors = ['#ffffff', '#fe0302', '#ff7204', '#ffaa02', '#ffd302', '#ffff00', '#a0ee00', '#00cd00', '#019899', '#4266be', '#89d5ff', '#cc0273']
const activeDm = ref([])
const sentCount = ref(0)
const totalDm = computed(() => props.danmakuList.length + sentCount.value)
let dmKey = 0
let lastTime = 0
let cursor = 0
let trackFree = [] // 每条轨道可再次使用的视频时间
let topFree = []
const LINE_H = 30

function layerSize() {
  const el = dmLayerRef.value
  return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 800, h: 450 }
}

function dmStyle(d) {
  return {
    top: d.track * LINE_H * dmScale.value + 'px',
    color: d.color,
    fontSize: 25 * dmScale.value + 'px',
    '--cw': d.cw + 'px',
    animationDuration: d.dur + 's',
  }
}

function pushDm(item, self = false) {
  const { w, h } = layerSize()
  const now = currentTime.value
  const fontSize = 25 * dmScale.value
  const textW = [...item.text].reduce((w, ch) => w + (ch.charCodeAt(0) > 255 ? fontSize : fontSize * 0.55), 0)
  const tracks = Math.max(1, Math.floor((h * 0.8) / (LINE_H * dmScale.value)))
  if (item.mode === 'top') {
    let t = topFree.findIndex((f, i) => i < tracks / 2 && (f ?? 0) <= now)
    if (t === -1) t = topFree.length < tracks / 2 ? topFree.length : -1
    if (t === -1 && !self) return
    t = Math.max(0, t)
    topFree[t] = now + 4
    activeDm.value.push({ ...item, key: ++dmKey, track: t, dur: 4, cw: w, self })
    return
  }
  // 所有弹幕匀速移动，长弹幕不会追尾短弹幕
  const speed = (w + 200) / dmSpeedRev.value
  const dur = (w + textW) / speed
  let track = -1
  for (let i = 0; i < tracks; i++) {
    if ((trackFree[i] ?? 0) <= now) {
      track = i
      break
    }
  }
  if (track === -1) {
    if (!self) return // 轨道满了，丢弃（与 B 站“防挡”行为一致）
    track = Math.floor(Math.random() * tracks)
  }
  trackFree[track] = now + (textW + 24) / speed
  activeDm.value.push({ ...item, key: ++dmKey, track, dur, cw: w, self })
}

function removeDm(key) {
  const i = activeDm.value.findIndex((d) => d.key === key)
  if (i !== -1) activeDm.value.splice(i, 1)
}

function resetDanmaku() {
  activeDm.value = []
  trackFree = []
  topFree = []
  lastTime = currentTime.value
  cursor = props.danmakuList.findIndex((d) => d.time >= lastTime)
  if (cursor === -1) cursor = props.danmakuList.length
}

watch(
  () => props.danmakuList,
  () => resetDanmaku()
)

let raf = 0
function tick() {
  const v = videoRef.value
  if (v && !v.paused) {
    const t = v.currentTime
    if (t < lastTime || t - lastTime > 2) resetDanmaku()
    const list = props.danmakuList
    while (cursor < list.length && list[cursor].time <= t) {
      if (dmOn.value) pushDm(list[cursor])
      cursor++
    }
    lastTime = t
  }
  raf = requestAnimationFrame(tick)
}

function sendDm() {
  const text = dmText.value.trim()
  if (!dmOn.value) return
  if (!text) return toast('请输入弹幕内容')
  const item = { id: 'self' + Date.now(), text, color: dmColor.value, mode: 'scroll', time: currentTime.value, sendTime: Date.now() }
  pushDm(item, true)
  sentCount.value++
  emit('send', item)
  dmText.value = ''
}

function toggleDm() {
  dmOn.value = !dmOn.value
  if (!dmOn.value) activeDm.value = []
}

// ------- 快捷键 -------
function onKey(e) {
  const tag = (e.target.tagName || '').toLowerCase()
  if (tag === 'input' || tag === 'textarea') return
  const v = videoRef.value
  switch (e.key) {
    case ' ':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowRight':
      e.preventDefault()
      seek(currentTime.value + 5)
      flash('快进 5 秒')
      break
    case 'ArrowLeft':
      e.preventDefault()
      seek(currentTime.value - 5)
      flash('快退 5 秒')
      break
    case 'ArrowUp':
      e.preventDefault()
      setVolume(v.volume + 0.1)
      flash(`音量 ${Math.round(v.volume * 100)}%`)
      break
    case 'ArrowDown':
      e.preventDefault()
      setVolume(v.volume - 0.1)
      flash(`音量 ${Math.round(v.volume * 100)}%`)
      break
    case 'f':
      toggleFull()
      break
    case 'd':
      toggleDm()
      break
    case 'm':
      toggleMute()
      break
    case 't':
      toggleWide()
      break
    case 'Escape':
      if (webFull.value) toggleWebFull()
      break
  }
}

watch(mirror, (m) => (videoRef.value.style.transform = m ? 'scaleX(-1)' : ''))

onMounted(() => {
  raf = requestAnimationFrame(tick)
  document.addEventListener('keydown', onKey)
  document.addEventListener('fullscreenchange', onFsChange)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('fullscreenchange', onFsChange)
  document.body.style.overflow = ''
})

defineExpose({ seek, play: () => videoRef.value?.play().catch(() => {}) })
</script>

<style scoped>
.bpx-player-container {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 0;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
.bpx-player-container.web-full {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
}
.bpx-player-container.web-full .bpx-player-primary-area,
.bpx-player-container.is-full .bpx-player-primary-area {
  flex: 1;
  aspect-ratio: auto;
  height: auto;
}
.bpx-player-container.is-full {
  display: flex;
  flex-direction: column;
}
.bpx-player-primary-area {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  user-select: none;
}
.bpx-player-primary-area.hide-cursor {
  cursor: none;
}
.bpx-player-video-area {
  position: absolute;
  inset: 0;
}
.bpx-player-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  display: block;
}

/* 弹幕 */
.bpx-player-row-dm-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  transition: opacity 0.2s;
}
.bpx-player-row-dm-wrap.hidden {
  visibility: hidden;
}
.dm {
  position: absolute;
  white-space: pre;
  font-weight: 700;
  line-height: 1.125;
  font-family: SimHei, "Microsoft YaHei", "PingFang SC", Arial, sans-serif;
  text-shadow: 1px 0 1px #000, 0 1px 1px #000, 0 -1px 1px #000, -1px 0 1px #000;
  will-change: transform;
}
.dm-scroll {
  left: 100%;
  animation-name: dm-scroll;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
.dm-top {
  left: 50%;
  transform: translateX(-50%);
  animation-name: dm-stay;
  animation-timing-function: linear;
}
.dm-self {
  border: 1px solid #66ccff;
  padding: 0 2px;
}
.paused .dm {
  animation-play-state: paused;
}
@keyframes dm-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-1 * var(--cw) - 100%));
  }
}
@keyframes dm-stay {
  from,
  to {
    opacity: 1;
  }
}

/* 状态 */
.bpx-player-loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-size: 13px;
  pointer-events: none;
}
.loading-tv {
  margin-bottom: 8px;
  animation: tvBounce 0.8s infinite ease-in-out;
}
@keyframes tvBounce {
  50% {
    transform: translateY(-6px);
  }
}
.bpx-player-error {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
  gap: 12px;
  background: #000;
}
.retry {
  padding: 6px 18px;
}
.bpx-player-state-wrap {
  position: absolute;
  right: 40px;
  bottom: 70px;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.4));
  pointer-events: none;
}
.bpx-player-start {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.15);
}
.start-btn {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0, 174, 236, 0.9);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 4px;
  transition: transform 0.2s;
}
.start-btn:hover {
  transform: scale(1.08);
}
.bpx-player-tooltip {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 4px;
  font-size: 14px;
  pointer-events: none;
}
.bpx-player-ending {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  gap: 16px;
  font-size: 16px;
}
.replay {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}
.replay:hover {
  background: var(--brand_blue);
}

/* 控制栏 */
.bpx-player-control-wrap {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 12px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
}
.bpx-player-control-wrap.show {
  opacity: 1;
}
.bpx-player-control-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 110px;
  background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.75));
  pointer-events: none;
}
.bpx-player-progress {
  position: relative;
  height: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.progress-track {
  position: relative;
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  transition: height 0.15s;
}
.bpx-player-progress:hover .progress-track {
  height: 5px;
}
.progress-buffer {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.35);
  border-radius: 2px;
}
.progress-played {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: var(--brand_blue);
  border-radius: 2px;
}
.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -55%);
  color: var(--brand_blue);
  background: #fff;
  border-radius: 6px;
  width: 22px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
}
.bpx-player-progress:hover .progress-thumb {
  opacity: 1;
}
.progress-preview {
  position: absolute;
  bottom: 22px;
  transform: translateX(-50%);
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 12px;
  border-radius: 3px;
  pointer-events: none;
  white-space: nowrap;
}
.bpx-player-control-bottom {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 42px;
  padding-bottom: 4px;
  color: rgba(255, 255, 255, 0.9);
}
.control-left,
.control-right {
  display: flex;
  align-items: center;
  height: 100%;
}
.ctrl-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
}
.ctrl-btn:hover,
.ctrl-btn.on {
  color: #fff;
}
.ctrl-btn.on {
  color: var(--brand_blue);
}
.ctrl-time {
  margin-left: 8px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ctrl-time .divide {
  margin: 0 4px;
}
.ctrl-text {
  height: 36px;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
}
.ctrl-text:hover {
  color: #fff;
}
.ctrl-menu {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}
.menu-list,
.volume-panel,
.setting-panel {
  display: none;
  position: absolute;
  bottom: 42px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(21, 21, 21, 0.9);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 110px;
  color: #fff;
  font-size: 13px;
  z-index: 20;
}
.ctrl-menu:hover .menu-list,
.ctrl-menu:hover .volume-panel,
.ctrl-menu:hover .setting-panel {
  display: block;
}
/* 让鼠标从按钮移到弹层时不断开 hover */
.ctrl-menu::after {
  content: '';
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  height: 16px;
}
.menu-list li {
  height: 36px;
  line-height: 36px;
  padding: 0 14px;
  text-align: center;
  cursor: pointer;
  white-space: nowrap;
}
.menu-list li:hover {
  background: rgba(255, 255, 255, 0.1);
}
.menu-list li.active {
  color: var(--brand_blue);
}
.vip-mark {
  margin-left: 6px;
  padding: 0 4px;
  background: var(--brand_pink);
  border-radius: 8px;
  font-size: 10px;
  line-height: 16px;
  display: inline-block;
}
.volume-panel {
  min-width: 32px;
  width: 32px;
  padding: 6px 0 10px;
}
.volume-number {
  text-align: center;
  font-size: 12px;
  margin-bottom: 6px;
}
.volume-slider {
  height: 70px;
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.volume-track {
  position: relative;
  width: 3px;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
.volume-fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--brand_blue);
  border-radius: 2px;
}
.volume-thumb {
  position: absolute;
  left: 50%;
  width: 12px;
  height: 12px;
  margin: 0 0 -6px -6px;
  background: var(--brand_blue);
  border-radius: 50%;
}
.setting-panel {
  min-width: 180px;
  padding: 10px 14px;
  left: auto;
  right: -60px;
  transform: none;
}
.setting-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin: 6px 0;
}
.setting-radio,
.setting-check {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 10px 6px 0;
  cursor: pointer;
}
.setting-radio input,
.setting-check input {
  accent-color: var(--brand_blue);
}

/* 发送栏 */
.bpx-player-sending-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 12px;
  background: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  color: var(--text2);
  font-size: 13px;
}
.web-full .bpx-player-sending-area,
.is-full .bpx-player-sending-area {
  background: #000;
  box-shadow: none;
}
.sending-info {
  white-space: nowrap;
  margin-right: 16px;
}
.sending-bar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  max-width: 640px;
  min-width: 0;
}
.dm-switch,
.dm-setting-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text2);
}
.dm-switch:not(.off) {
  color: var(--brand_blue);
}
.dm-setting {
  margin-right: 8px;
}
.dm-setting-panel {
  display: none;
  position: absolute;
  bottom: 40px;
  left: -100px;
  width: 280px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.12);
  z-index: 20;
}
.dm-setting:hover .dm-setting-panel {
  display: block;
}
.dm-setting-panel .row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  color: var(--text1);
}
.dm-setting-panel input[type='range'] {
  flex: 1;
  accent-color: var(--brand_blue);
}
.dm-setting-panel .val {
  width: 36px;
  text-align: right;
  color: var(--text3);
}
.dm-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 34px;
  border-radius: 8px;
  background: var(--graph_bg_regular);
  min-width: 0;
  overflow: visible;
}
.dm-input-wrap.disabled {
  opacity: 0.7;
}
.dm-color {
  width: 34px;
  justify-content: center;
}
.color-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color-btn i {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--line_regular);
}
.color-panel {
  display: none;
  position: absolute;
  bottom: 40px;
  left: -10px;
  width: 196px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.12);
  flex-wrap: wrap;
  gap: 8px;
  z-index: 20;
}
.dm-color:hover .color-panel {
  display: flex;
}
.color-panel span {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--line_regular);
  cursor: pointer;
}
.color-panel span.active {
  outline: 2px solid var(--brand_blue);
  outline-offset: 1px;
}
.dm-input {
  flex: 1;
  height: 100%;
  font-size: 13px;
  min-width: 0;
  color: var(--text1);
}
.dm-input::placeholder {
  color: var(--text3);
}
.dm-hint {
  display: flex;
  align-items: center;
  margin: 0 10px;
  white-space: nowrap;
  color: var(--text2);
  font-size: 13px;
  cursor: pointer;
}
.dm-hint:hover {
  color: var(--brand_blue);
}
.dm-send {
  height: 34px;
  width: 60px;
  border-radius: 0 8px 8px 0;
  background: var(--brand_blue);
  color: #fff;
  font-size: 13px;
  flex-shrink: 0;
}
.dm-send:hover {
  background: #40c5f1;
}
.dm-send:disabled {
  background: var(--graph_bg_thick);
  color: var(--text3);
  cursor: not-allowed;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
