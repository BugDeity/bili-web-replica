<template>
  <div class="bili-video-card">
    <router-link :to="`/video/${video.bvid}`" class="card-image" :title="video.title">
      <LazyImg :src="video.cover" class="cover" />
      <div class="card-mask">
        <div class="stats">
          <span class="stat"><Icon name="play-count" :size="18" :stroke="1.6" />{{ formatCount(video.view) }}</span>
          <span class="stat"><Icon name="danmaku" :size="18" :stroke="1.6" />{{ formatCount(video.danmaku) }}</span>
        </div>
        <span class="duration">{{ formatDuration(video.duration) }}</span>
      </div>
      <button class="watch-later" :class="{ added }" @click.prevent="toggleLater" :title="added ? '移除' : '稍后再看'">
        <Icon :name="added ? 'check' : 'watch-later'" :size="18" :stroke="2" />
        <span class="tip">{{ added ? '移除' : '稍后再看' }}</span>
      </button>
    </router-link>
    <div class="card-info">
      <h3 class="card-title clamp-2" :title="video.title">
        <router-link :to="`/video/${video.bvid}`">
          <template v-if="keyword"><span v-html="highlight(video.title)"></span></template>
          <template v-else>{{ video.title }}</template>
        </router-link>
      </h3>
      <div class="card-bottom">
        <span v-if="video.rcmdReason && !hideReason" class="rcmd-reason">{{ video.rcmdReason }}</span>
        <router-link :to="`/space/${video.owner.mid}`" class="owner">
          <Icon name="up" :size="17" :stroke="1.5" class="up-icon" />
          <span class="owner-name ellipsis">{{ video.owner.name }}</span>
          <span class="date"> · {{ formatPubdate(video.pubdate) }}</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import LazyImg from './LazyImg.vue'
import { formatCount, formatDuration, formatPubdate } from '../data/mock'
import { toast } from '../utils/toast'

const props = defineProps({
  video: { type: Object, required: true },
  keyword: { type: String, default: '' },
  hideReason: Boolean,
})

const added = ref(false)
function toggleLater() {
  added.value = !added.value
  toast(added.value ? '已添加至稍后再看' : '已从稍后再看移除')
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
function highlight(title) {
  const t = esc(title)
  const kw = esc(props.keyword.trim())
  if (!kw) return t
  return t.split(kw).join(`<em class="keyword">${kw}</em>`)
}
</script>

<style scoped>
.bili-video-card {
  position: relative;
  min-width: 0;
}
.card-image {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--graph_bg_regular);
}
.cover {
  width: 100%;
  height: 100%;
}
.card-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 38px;
  padding: 16px 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
  color: #fff;
  font-size: 13px;
  line-height: 18px;
  pointer-events: none;
}
.stats {
  display: flex;
  align-items: center;
  min-width: 0;
}
.stat {
  display: flex;
  align-items: center;
  margin-right: 12px;
  white-space: nowrap;
}
.stat .bili-icon {
  margin-right: 2px;
}
.duration {
  white-space: nowrap;
}
.watch-later {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.card-image:hover .watch-later {
  opacity: 1;
}
.watch-later .tip {
  position: absolute;
  top: 34px;
  right: 0;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.8);
  font-size: 12px;
  white-space: nowrap;
  display: none;
}
.watch-later:hover .tip {
  display: block;
}

.card-info {
  padding-top: 12px;
  padding-right: 4px;
}
.card-title {
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  min-height: 44px;
  color: var(--text1);
  margin-bottom: 4px;
}
.card-title a {
  transition: color 0.2s;
}
.card-title a:hover {
  color: var(--brand_blue);
}
.card-title :deep(.keyword) {
  font-style: normal;
  color: var(--keyword);
}
.card-bottom {
  display: flex;
  align-items: center;
  font-size: 13px;
  line-height: 17px;
  color: var(--text3);
  min-width: 0;
}
.rcmd-reason {
  flex-shrink: 0;
  margin-right: 6px;
  padding: 0 4px;
  border-radius: 4px;
  background: rgba(255, 127, 36, 0.1);
  color: var(--orange);
  font-size: 12px;
  line-height: 17px;
}
.owner {
  display: flex;
  align-items: center;
  min-width: 0;
  transition: color 0.2s;
}
.owner:hover {
  color: var(--brand_blue);
}
.up-icon {
  margin-right: 4px;
}
.owner-name {
  min-width: 0;
}
.date {
  flex-shrink: 0;
  white-space: pre;
}
</style>
