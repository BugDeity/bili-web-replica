<template>
  <div class="popular-page">
    <BiliHeader />

    <div class="popular-container">
      <ul class="nav-tabs">
        <li v-for="t in tabs" :key="t.key" class="nav-tabs__item" :class="{ active: type === t.key }" @click="go(t.key)">
          <span class="tab-icon" :style="{ background: t.color }"><Icon :name="t.icon" :size="22" :stroke="2" /></span>
          <span class="tab-name">{{ t.name }}</span>
        </li>
      </ul>

      <!-- 综合热门 / 每周必看 / 入站必刷 -->
      <template v-if="type !== 'rank'">
        <div class="popular-desc">
          <template v-if="type === 'all'">各个分区正在飙升的视频</template>
          <template v-else-if="type === 'weekly'">
            <span class="weekly-select">第 {{ 342 - weekIdx }} 期 · {{ weekRange }}<Icon name="chevron-down" :size="12" :stroke="2.4" /></span>
            <span class="weekly-nav">
              <button :disabled="weekIdx >= 10" @click="weekIdx++">上一期</button>
              <button :disabled="weekIdx === 0" @click="weekIdx--">下一期</button>
            </span>
          </template>
          <template v-else>哔哩哔哩历史上的经典必刷视频</template>
        </div>
        <div class="card-list">
          <div v-for="(v, i) in list" :key="v.bvid" class="video-card">
            <router-link :to="`/video/${v.bvid}`" class="video-card__img">
              <LazyImg :src="v.cover" />
              <span class="length">{{ formatDuration(v.duration) }}</span>
              <span v-if="type === 'weekly'" class="weekly-rank">{{ i + 1 }}</span>
            </router-link>
            <div class="video-card__info">
              <router-link :to="`/video/${v.bvid}`" class="video-name clamp-2" :title="v.title">{{ v.title }}</router-link>
              <div class="info-bottom">
                <span v-if="reasonOf(v, i)" class="rcmd-tag">{{ reasonOf(v, i) }}</span>
                <router-link :to="`/space/${v.owner.mid}`" class="up-name"><Icon name="up" :size="16" :stroke="1.5" /><span class="ellipsis">{{ v.owner.name }}</span></router-link>
                <p class="video-stat">
                  <span><Icon name="play-count" :size="16" :stroke="1.5" />{{ formatCount(v.view) }}</span>
                  <span><Icon name="like" :size="15" :stroke="1.6" />{{ formatCount(v.like) }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 排行榜 -->
      <template v-else>
        <ul class="rank-tab">
          <li v-for="c in rankCats" :key="c" :class="{ active: rankCat === c }" @click="rankCat = c">{{ c }}</li>
        </ul>
        <div class="rank-tips">排行榜根据稿件内容质量，近期的数据综合展示，动态更新</div>
        <ul class="rank-list">
          <li v-for="(v, i) in rankList" :key="v.bvid" class="rank-item">
            <span class="num" :class="'n' + (i + 1)">{{ i + 1 }}</span>
            <router-link :to="`/video/${v.bvid}`" class="img"><LazyImg :src="v.cover" /></router-link>
            <div class="info">
              <router-link :to="`/video/${v.bvid}`" class="title clamp-2">{{ v.title }}</router-link>
              <div class="detail">
                <span class="data-box"><Icon name="play-count" :size="14" :stroke="1.5" />{{ formatCount(v.view) }}</span>
                <span class="data-box"><Icon name="danmaku" :size="14" :stroke="1.5" />{{ formatCount(v.danmaku) }}</span>
              </div>
              <router-link :to="`/space/${v.owner.mid}`" class="data-box up"><Icon name="up" :size="14" :stroke="1.5" />{{ v.owner.name }}</router-link>
            </div>
            <div class="pts">
              <div>{{ formatCount(Math.floor(v.view * 0.6 + v.like * 3 + v.coin * 5)) }}</div>
              <span>综合得分</span>
            </div>
          </li>
        </ul>
      </template>
    </div>
    <PaletteButtons />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BiliHeader from '../components/BiliHeader.vue'
import Icon from '../components/Icon.vue'
import LazyImg from '../components/LazyImg.vue'
import PaletteButtons from '../components/PaletteButtons.vue'
import { getPopular, formatCount, formatDuration, rngFor } from '../data/mock'

const route = useRoute()
const router = useRouter()
const type = computed(() => route.params.type || 'all')

const tabs = [
  { key: 'all', name: '综合热门', icon: 'fire', color: '#ff6b52' },
  { key: 'weekly', name: '每周必看', icon: 'calendar', color: '#ffa726' },
  { key: 'history', name: '入站必刷', icon: 'rocket', color: '#fb7299' },
  { key: 'rank', name: '排行榜', icon: 'trophy', color: '#00aeec' },
]
function go(k) {
  router.replace(k === 'all' ? '/popular' : `/popular/${k}`)
}

const weekIdx = ref(0)
const weekRange = computed(() => {
  const end = new Date('2026-10-17')
  end.setDate(end.getDate() - weekIdx.value * 7)
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  const f = (d) => `${d.getMonth() + 1}月${d.getDate()}日`
  return `${f(start)} - ${f(end)}`
})

const list = computed(() => {
  const all = getPopular(type.value === 'weekly' ? 'weekly' + weekIdx.value : type.value)
  return type.value === 'weekly' ? all.slice(0, 30) : all
})
function reasonOf(v, i) {
  if (type.value === 'history') return '经典必刷'
  if (v.view > 1000000) return '百万播放'
  if (i % 5 === 0) return formatCount(v.like) + '点赞'
  return ''
}

const rankCats = ['全站', '国创相关', '动画', '音乐', '舞蹈', '游戏', '知识', '科技', '运动', '汽车', '生活', '美食', '动物圈', '鬼畜', '时尚', '娱乐', '影视']
const rankCat = ref('全站')
const rankList = computed(() => {
  const all = getPopular('rank')
  if (rankCat.value === '全站') return all
  const r = rngFor('rank' + rankCat.value)
  return [...all].sort(() => r() - 0.5).slice(0, 50).sort((a, b) => b.view - a.view)
})
</script>

<style scoped>
.popular-page {
  padding-bottom: 60px;
}
.popular-container {
  width: 1280px;
  max-width: calc(100% - 40px);
  margin: 0 auto;
}
.nav-tabs {
  display: flex;
  gap: 32px;
  padding: 24px 0 18px;
  border-bottom: 1px solid var(--line_regular);
}
.nav-tabs__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  width: 64px;
}
.tab-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0.85;
  transition: all 0.2s;
}
.nav-tabs__item:hover .tab-icon,
.nav-tabs__item.active .tab-icon {
  opacity: 1;
  transform: translateY(-2px);
}
.tab-name {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text2);
  white-space: nowrap;
}
.nav-tabs__item.active .tab-name {
  color: var(--brand_blue);
  font-weight: 500;
}
.popular-desc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  font-size: 14px;
  color: var(--text3);
}
.weekly-select {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  color: var(--text1);
  font-weight: 500;
}
.weekly-nav button {
  height: 32px;
  padding: 0 16px;
  margin-left: 8px;
  border: 1px solid var(--line_regular);
  border-radius: 6px;
  font-size: 13px;
}
.weekly-nav button:hover:not(:disabled) {
  color: var(--brand_blue);
  border-color: var(--brand_blue);
}
.weekly-nav button:disabled {
  color: var(--text4);
  cursor: not-allowed;
}
.card-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 40px;
}
.video-card {
  display: flex;
}
.video-card__img {
  position: relative;
  width: 206px;
  height: 116px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.video-card__img .lazy-wrap {
  width: 100%;
  height: 100%;
}
.length {
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
.weekly-rank {
  position: absolute;
  left: 0;
  top: 0;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: 6px 0 6px 0;
  background: var(--brand_pink);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 26px;
  text-align: center;
}
.video-card__info {
  flex: 1;
  min-width: 0;
  margin-left: 16px;
  display: flex;
  flex-direction: column;
}
.video-name {
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  color: var(--text1);
}
.video-name:hover {
  color: var(--brand_blue);
}
.info-bottom {
  margin-top: auto;
  font-size: 13px;
  color: var(--text3);
}
.rcmd-tag {
  display: inline-block;
  padding: 0 5px;
  margin-bottom: 4px;
  border-radius: 4px;
  background: rgba(255, 127, 36, 0.1);
  color: var(--orange);
  font-size: 12px;
  line-height: 18px;
}
.up-name {
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 20px;
  min-width: 0;
}
.up-name:hover {
  color: var(--brand_blue);
}
.video-stat {
  display: flex;
  gap: 16px;
  line-height: 20px;
}
.video-stat span {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* 排行榜 */
.rank-tab {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 20px;
}
.rank-tab li {
  height: 30px;
  padding: 0 14px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 30px;
  color: var(--text2);
  cursor: pointer;
}
.rank-tab li:hover {
  color: var(--brand_blue);
}
.rank-tab li.active {
  background: var(--brand_blue);
  color: #fff;
}
.rank-tips {
  margin: 16px 0 8px;
  padding: 10px 16px;
  background: var(--bg2);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text3);
}
.rank-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--line_light);
}
.num {
  width: 60px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text3);
  text-align: center;
  flex-shrink: 0;
}
.num.n1 {
  color: #fe2c55;
  font-size: 24px;
}
.num.n2 {
  color: #ff6633;
  font-size: 22px;
}
.num.n3 {
  color: #ffa726;
  font-size: 20px;
}
.rank-item .img {
  width: 160px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.rank-item .img .lazy-wrap {
  width: 100%;
  height: 100%;
}
.rank-item .info {
  flex: 1;
  min-width: 0;
  height: 100px;
  margin-left: 16px;
  display: flex;
  flex-direction: column;
}
.rank-item .title {
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
}
.rank-item .title:hover {
  color: var(--brand_blue);
}
.detail {
  display: flex;
  gap: 16px;
  margin-top: auto;
}
.data-box {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text3);
  line-height: 20px;
}
.data-box.up:hover {
  color: var(--brand_blue);
}
.pts {
  width: 120px;
  text-align: center;
  flex-shrink: 0;
}
.pts div {
  font-size: 16px;
  font-weight: 700;
  color: var(--text1);
}
.pts span {
  font-size: 12px;
  color: var(--text3);
}
</style>
