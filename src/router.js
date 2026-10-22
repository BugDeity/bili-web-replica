import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('./views/Home.vue'), meta: { title: '哔哩哔哩 (゜-゜)つロ 干杯~-bilibili' } },
  { path: '/video/:bvid', name: 'video', component: () => import('./views/Video.vue') },
  { path: '/search', name: 'search', component: () => import('./views/Search.vue') },
  { path: '/space/:mid', name: 'space', component: () => import('./views/Space.vue') },
  { path: '/popular/:type?', name: 'popular', component: () => import('./views/Popular.vue'), meta: { title: '热门视频-哔哩哔哩' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.meta.title) document.title = to.meta.title
})

export default router
