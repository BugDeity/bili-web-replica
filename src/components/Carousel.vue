<template>
  <div class="recommended-swipe" @mouseenter="stop" @mouseleave="start">
    <div class="carousel-area" :style="{ backgroundColor: current.color }">
      <router-link
        v-for="(s, i) in slides"
        :key="s.seed"
        :to="`/video/${s.bvid}`"
        class="carousel-item"
        :class="{ active: i === index }"
      >
        <LazyImg :src="s.cover" class="carousel-img" />
      </router-link>
      <div class="carousel-shade" :style="{ background: `linear-gradient(180deg, transparent, ${current.color})` }"></div>
      <div class="carousel-footer" :style="{ backgroundColor: current.color }">
        <router-link :to="`/video/${current.bvid}`" class="carousel-title ellipsis">{{ current.title }}</router-link>
        <div class="carousel-bottom">
          <ul class="dots">
            <li v-for="(s, i) in slides" :key="s.seed" :class="{ active: i === index }" @click="go(i)"></li>
          </ul>
          <div class="arrows">
            <button class="arrow" @click="go(index - 1)"><Icon name="chevron-left" :size="14" :stroke="2.4" /></button>
            <button class="arrow" @click="go(index + 1)"><Icon name="chevron-right" :size="14" :stroke="2.4" /></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'
import LazyImg from './LazyImg.vue'
import { carouselSlides as slides } from '../data/mock'

const index = ref(0)
const current = computed(() => slides[index.value])
function go(i) {
  index.value = (i + slides.length) % slides.length
}

let timer = null
function start() {
  stop()
  timer = setInterval(() => go(index.value + 1), 5000)
}
function stop() {
  clearInterval(timer)
}
onMounted(start)
onBeforeUnmount(stop)
</script>

<style scoped>
.recommended-swipe {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
  position: relative;
  min-height: 0;
}
.carousel-area {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  overflow: hidden;
  transition: background-color 0.4s;
  /* 图片区 + 底部信息区 */
  display: flex;
  flex-direction: column;
}
.carousel-item {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 76px;
  opacity: 0;
  transition: opacity 0.5s;
  z-index: 0;
}
.carousel-item.active {
  opacity: 1;
  z-index: 1;
}
.carousel-img {
  width: 100%;
  height: 100%;
}
.carousel-shade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 76px;
  height: 90px;
  z-index: 2;
  pointer-events: none;
  transition: background 0.4s;
}
.carousel-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 76px;
  padding: 10px 16px 14px;
  z-index: 2;
  transition: background-color 0.4s;
  color: #fff;
}
.carousel-title {
  display: block;
  font-size: 18px;
  line-height: 25px;
  font-weight: 500;
  margin-bottom: 10px;
}
.carousel-title:hover {
  text-decoration: underline;
}
.carousel-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dots {
  display: flex;
  align-items: center;
}
.dots li {
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.3s;
}
.dots li.active {
  width: 14px;
  height: 14px;
  margin: -3px 5px -3px 0;
  background: #fff;
}
.arrows {
  display: flex;
  gap: 12px;
}
.arrow {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.arrow:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
