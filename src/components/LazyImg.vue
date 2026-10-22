<template>
  <div class="lazy-wrap cover-placeholder">
    <img
      :src="src"
      :alt="alt"
      loading="lazy"
      class="lazy-img"
      :class="{ loaded }"
      @load="loaded = true"
      @error="loaded = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ src: String, alt: { type: String, default: '' } })
const loaded = ref(false)
watch(() => props.src, () => (loaded.value = false))
</script>

<style scoped>
.lazy-wrap {
  position: relative;
  overflow: hidden;
}
.lazy-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
