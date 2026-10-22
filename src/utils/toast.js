import { ref } from 'vue'

export const toastMsg = ref('')
let timer = null

export function toast(msg, ms = 1600) {
  toastMsg.value = msg
  clearTimeout(timer)
  timer = setTimeout(() => (toastMsg.value = ''), ms)
}
