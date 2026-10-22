<template>
  <router-view :key="$route.path" />
  <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
</template>

<script setup>
import { toastMsg } from './utils/toast'
</script>
