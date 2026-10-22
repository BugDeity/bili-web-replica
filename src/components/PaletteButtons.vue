<template>
  <div class="palette-button-wrap">
    <button class="primary-btn" @click="toast('感谢反馈！这是一个演示站点')">
      <Icon name="feedback" :size="18" />
      <span>新版反馈</span>
    </button>
    <button v-if="refresh" class="primary-btn" @click="$emit('refresh')">
      <Icon name="refresh" :size="18" />
      <span>刷新</span>
    </button>
    <transition name="fade">
      <button v-show="showTop" class="primary-btn top-btn" @click="toTop">
        <Icon name="arrow-up" :size="18" />
        <span>顶部</span>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'
import { toast } from '../utils/toast'

defineProps({ refresh: Boolean })
defineEmits(['refresh'])

const showTop = ref(false)
const onScroll = () => (showTop.value = window.scrollY > 600)
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.palette-button-wrap {
  position: fixed;
  right: 24px;
  bottom: 40px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.primary-btn {
  width: 40px;
  min-height: 40px;
  padding: 7px 0 6px;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  background: #fff;
  color: var(--text1);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  line-height: 14px;
  transition: background 0.2s;
}
.primary-btn span {
  margin-top: 2px;
  width: 26px;
  word-break: break-all;
  text-align: center;
}
.primary-btn:hover {
  background: var(--graph_bg_thick);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
