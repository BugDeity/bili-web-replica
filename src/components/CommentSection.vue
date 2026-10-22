<template>
  <div class="bili-comment">
    <div class="reply-header">
      <div class="reply-navigation">
        <h2 class="nav-title">评论<span class="total-reply">{{ formatCount(total) }}</span></h2>
        <div class="nav-sort">
          <span :class="{ active: sort === 'hot' }" @click="sort = 'hot'">最热</span>
          <i class="sort-div"></i>
          <span :class="{ active: sort === 'new' }" @click="sort = 'new'">最新</span>
        </div>
      </div>
      <ReplyBox :face="me.face" placeholder="你的评论一针见血" @submit="addReply" />
    </div>

    <div class="reply-list">
      <div v-for="r in list" :key="r.rpid" class="reply-item">
        <a class="root-avatar">
          <img :src="r.user.face" loading="lazy" alt="" />
        </a>
        <div class="content-warp">
          <div class="user-info">
            <span class="user-name" :class="{ vip: r.user.vip }">{{ r.user.name }}</span>
            <LevelBadge :level="r.user.level" />
            <span v-if="r.isUp" class="up-tag">UP</span>
          </div>
          <div class="root-reply">
            <span class="reply-content-container">
              <span v-if="r.top" class="top-icon">置顶</span>
              <span class="reply-content" v-html="renderContent(r.content)"></span>
            </span>
            <div class="reply-info">
              <span class="reply-time">{{ formatFullDate(r.ctime).slice(0, 16) }}</span>
              <span class="reply-like" :class="{ liked: r.liked }" @click="toggleLike(r)">
                <Icon :name="r.liked ? 'like-fill' : 'like'" :size="16" :stroke="1.6" />
                <span v-if="r.like">{{ formatCount(r.like) }}</span>
              </span>
              <span class="reply-dislike" :class="{ disliked: r.disliked }" @click="r.disliked = !r.disliked">
                <Icon :name="r.disliked ? 'dislike-fill' : 'dislike'" :size="16" :stroke="1.6" />
              </span>
              <span class="reply-btn" @click="replyTo = replyTo === r.rpid ? null : r.rpid">回复</span>
              <span class="reply-more"><Icon name="more-v" :size="16" /></span>
            </div>
            <div v-if="r.upLiked" class="reply-tag-list"><span class="reply-tag">UP主觉得很赞</span></div>
          </div>

          <div v-if="r.replies.length" class="sub-reply-container">
            <div v-for="s in r.expanded ? r.allReplies : r.replies" :key="s.rpid" class="sub-reply-item">
              <img class="sub-avatar" :src="s.user.face" loading="lazy" alt="" />
              <span class="sub-user-name" :class="{ vip: s.user.vip }">{{ s.user.name }}</span>
              <LevelBadge :level="s.user.level" small />
              <span v-if="s.replyTo" class="sub-reply-to">回复 <a>@{{ s.replyTo }}</a> :</span>
              <span class="reply-content" v-html="renderContent(s.content)"></span>
              <div class="sub-reply-info">
                <span class="reply-time">{{ formatFullDate(s.ctime).slice(0, 16) }}</span>
                <span class="reply-like" :class="{ liked: s.liked }" @click="toggleLike(s)">
                  <Icon :name="s.liked ? 'like-fill' : 'like'" :size="16" :stroke="1.6" />
                  <span v-if="s.like">{{ s.like }}</span>
                </span>
                <span class="reply-btn" @click="replyTo = replyTo === s.rpid ? null : s.rpid">回复</span>
              </div>
              <ReplyBox
                v-if="replyTo === s.rpid"
                class="inline-box"
                :face="me.face"
                :placeholder="`回复 @${s.user.name} :`"
                autofocus
                @submit="(t) => addSub(r, t, s.user.name)"
              />
            </div>
            <div v-if="r.replyCount > r.replies.length && !r.expanded" class="view-more">
              共{{ r.replyCount }}条回复, <span class="view-more-btn" @click="expand(r)">点击查看</span>
            </div>
            <div v-if="r.expanded && r.replyCount > 10" class="pagination">
              共{{ Math.ceil(r.replyCount / 10) }}页
              <span class="page" :class="{ cur: r.page === p }" v-for="p in Math.min(5, Math.ceil(r.replyCount / 10))" :key="p" @click="goPage(r, p)">{{ p }}</span>
              <span class="page" v-if="r.page < Math.ceil(r.replyCount / 10)" @click="goPage(r, r.page + 1)">下一页</span>
            </div>
          </div>
          <ReplyBox
            v-if="replyTo === r.rpid"
            class="inline-box"
            :face="me.face"
            :placeholder="`回复 @${r.user.name} :`"
            autofocus
            @submit="(t) => addSub(r, t)"
          />
          <div class="bottom-line"></div>
        </div>
      </div>
      <div class="reply-end">没有更多评论</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineComponent, h, nextTick } from 'vue'
import Icon from './Icon.vue'
import { getComments, formatCount, formatFullDate, LOGIN_USER, img, rngFor } from '../data/mock'
import { toast } from '../utils/toast'

const props = defineProps({
  bvid: String,
  count: Number,
  upMid: Number,
})

const me = LOGIN_USER
const sort = ref('hot')
const list = ref([])
const total = ref(props.count)
const replyTo = ref(null)

function load() {
  list.value = getComments(props.bvid, sort.value).map((r) => ({ ...r, liked: false, disliked: false, expanded: false, page: 1, allReplies: [] }))
}
watch(sort, load, { immediate: true })

// 表情：把 [xxx] 渲染成 emoji
const EMOTES = { doge: '🐶', 笑哭: '😂', 吃瓜: '🍉', 妙啊: '👍', 辣眼睛: '🙈', 星星眼: '🤩', 哦呼: '😯', 打call: '🙌', 藏狐: '🦊', 微笑: '🙂', 呲牙: '😁', 哭泣: '😭', 喜欢: '😍', 生气: '😠', 惊讶: '😲', 害羞: '😳' }
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
function renderContent(text) {
  return esc(text).replace(/\[(.+?)\]/g, (m, k) => (EMOTES[k] ? `<span class="emote" title="[${k}]">${EMOTES[k]}</span>` : m))
}

function toggleLike(item) {
  item.liked = !item.liked
  item.like += item.liked ? 1 : -1
}

function addReply(text) {
  list.value.unshift({
    rpid: 'me' + Date.now(),
    user: { ...me },
    content: text,
    like: 0,
    ctime: Date.now(),
    replies: [],
    allReplies: [],
    replyCount: 0,
    liked: false,
    disliked: false,
    isUp: me.mid === props.upMid,
  })
  total.value++
  toast('发送成功')
}

function addSub(root, text, replyToName) {
  const sub = { rpid: 'me' + Date.now(), user: { ...me }, content: text, like: 0, ctime: Date.now(), replyTo: replyToName, liked: false }
  root.replies.push(sub)
  if (root.expanded) root.allReplies.push(sub)
  root.replyCount++
  total.value++
  replyTo.value = null
  toast('回复成功')
}

const SUB_TEXTS = ['哈哈哈哈哈哈', '确实是这样', '说得好！', '这条评论值得置顶', '同感 +1', '我也是这么想的', '笑死，太真实了', '前排支持', '你说得对，但是……', '已阅', '[doge][doge]', '[笑哭]']
function genPage(root, p) {
  const r = rngFor(root.rpid + 'p' + p)
  const n = Math.min(10, root.replyCount - (p - 1) * 10)
  return Array.from({ length: n }, (_, i) => ({
    rpid: `${root.rpid}-p${p}-${i}`,
    user: { name: '网友' + Math.floor(r() * 99999), face: img(`sub${root.rpid}${p}${i}`, 64, 64), level: 2 + Math.floor(r() * 5), vip: r() > 0.7 },
    content: SUB_TEXTS[Math.floor(r() * SUB_TEXTS.length)],
    like: Math.floor(r() * 300),
    ctime: root.ctime + Math.floor(r() * 86400 * 3) * 1000,
    liked: false,
  }))
}
function expand(root) {
  root.expanded = true
  root.page = 1
  root.allReplies = [...root.replies, ...genPage(root, 1)].slice(0, 10)
}
function goPage(root, p) {
  root.page = p
  root.allReplies = genPage(root, p)
}

// ---- 小组件 ----
const LV_COLORS = ['#c0c0c0', '#c0c0c0', '#8bd29b', '#7bcdef', '#febb8b', '#ee672a', '#f04c49']
const LevelBadge = defineComponent({
  props: { level: Number, small: Boolean },
  setup(p) {
    return () =>
      h('span', { class: ['lv-badge', { small: p.small }], style: { background: LV_COLORS[p.level] || '#c0c0c0' } }, 'LV' + p.level)
  },
})

const ReplyBox = defineComponent({
  props: { face: String, placeholder: String, autofocus: Boolean },
  emits: ['submit'],
  setup(p, { emit }) {
    const text = ref('')
    const focused = ref(p.autofocus)
    const showEmoji = ref(false)
    const ta = ref(null)
    if (p.autofocus) nextTick(() => ta.value && ta.value.focus())
    const submit = () => {
      const t = text.value.trim()
      if (!t) return
      emit('submit', t)
      text.value = ''
      showEmoji.value = false
    }
    const insert = (k) => {
      text.value += `[${k}]`
      ta.value && ta.value.focus()
    }
    return () =>
      h('div', { class: ['reply-box', { focused: focused.value || text.value }] }, [
        h('div', { class: 'box-normal' }, [
          h('div', { class: 'reply-box-avatar' }, [h('img', { src: p.face, alt: '' })]),
          h('div', { class: 'reply-box-warp' }, [
            h('textarea', {
              ref: ta,
              class: 'reply-box-textarea',
              placeholder: p.placeholder,
              value: text.value,
              onInput: (e) => (text.value = e.target.value),
              onFocus: () => (focused.value = true),
              onKeydown: (e) => {
                e.stopPropagation()
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
              },
            }),
          ]),
        ]),
        h('div', { class: 'box-expand' }, [
          h('div', { class: 'box-left' }, [
            h('div', { class: ['tool-btn', { active: showEmoji.value }], onClick: () => (showEmoji.value = !showEmoji.value) }, [h(Icon, { name: 'emoji', size: 18 })]),
            h('div', { class: 'tool-btn', onClick: () => { text.value += '@'; ta.value && ta.value.focus() } }, [h(Icon, { name: 'at', size: 18 })]),
            h('div', { class: 'tool-btn', onClick: () => toast('图片上传为演示功能') }, [h(Icon, { name: 'image', size: 18 })]),
            showEmoji.value
              ? h(
                  'div',
                  { class: 'emoji-panel' },
                  [h('div', { class: 'emoji-title' }, '小黄脸')].concat(
                    Object.entries(EMOTES).map(([k, v]) => h('span', { class: 'emoji-item', title: k, onClick: () => insert(k) }, v))
                  )
                )
              : null,
          ]),
          h('button', { class: ['send-btn', { disabled: !text.value.trim() }], onClick: submit }, '发布'),
        ]),
      ])
  },
})
</script>

<style scoped>
.bili-comment {
  margin-top: 24px;
  padding-bottom: 60px;
}
.reply-navigation {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}
.nav-title {
  display: flex;
  align-items: baseline;
  font-size: 20px;
  font-weight: 500;
  color: var(--text1);
}
.total-reply {
  margin: 0 36px 0 6px;
  font-size: 13px;
  font-weight: 400;
  color: var(--text3);
}
.nav-sort {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--text3);
}
.nav-sort span {
  cursor: pointer;
}
.nav-sort span:hover,
.nav-sort span.active {
  color: var(--text1);
}
.sort-div {
  width: 1px;
  height: 11px;
  margin: 0 12px;
  background: var(--text3);
}

/* 回复框 */
:deep(.reply-box) {
  position: relative;
  padding-bottom: 14px;
}
:deep(.box-normal) {
  display: flex;
  align-items: flex-start;
}
:deep(.reply-box-avatar) {
  width: 80px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
:deep(.reply-box-avatar img) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_regular);
}
:deep(.reply-box-warp) {
  flex: 1;
  position: relative;
}
:deep(.reply-box-textarea) {
  display: block;
  width: 100%;
  height: 50px;
  padding: 5px 10px;
  border: 1px solid var(--graph_bg_regular);
  border-radius: 6px;
  background: var(--graph_bg_regular);
  font-size: 13px;
  line-height: 38px;
  resize: none;
  transition: all 0.2s;
}
:deep(.reply-box-textarea:hover) {
  background: #fff;
  border-color: var(--graph_bg_thick);
}
:deep(.reply-box.focused .reply-box-textarea) {
  height: 64px;
  line-height: 20px;
  background: #fff;
  border-color: var(--brand_blue);
}
:deep(.box-expand) {
  display: none;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0 0 80px;
}
:deep(.reply-box.focused .box-expand) {
  display: flex;
}
:deep(.box-left) {
  position: relative;
  display: flex;
  gap: 6px;
}
:deep(.tool-btn) {
  width: 32px;
  height: 26px;
  border: 1px solid var(--line_regular);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text3);
  cursor: pointer;
}
:deep(.tool-btn:hover),
:deep(.tool-btn.active) {
  color: var(--brand_blue);
  border-color: var(--brand_blue);
}
:deep(.emoji-panel) {
  position: absolute;
  top: 34px;
  left: 0;
  width: 320px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--line_regular);
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  z-index: 10;
}
:deep(.emoji-title) {
  width: 100%;
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 4px;
}
:deep(.emoji-item) {
  width: 32px;
  height: 32px;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
}
:deep(.emoji-item:hover) {
  background: var(--graph_bg_regular);
}
:deep(.send-btn) {
  width: 70px;
  height: 32px;
  border-radius: 4px;
  background: var(--brand_blue);
  color: #fff;
  font-size: 13px;
}
:deep(.send-btn.disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 列表 */
.reply-list {
  margin-top: 14px;
}
.reply-item {
  position: relative;
  display: flex;
  padding-top: 22px;
}
.root-avatar {
  width: 80px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.root-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_regular);
}
.content-warp {
  flex: 1;
  min-width: 0;
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  margin-right: 5px;
  cursor: pointer;
}
.user-name.vip,
.sub-user-name.vip {
  color: var(--brand_pink);
}
:deep(.lv-badge) {
  display: inline-block;
  height: 12px;
  padding: 0 3px;
  border-radius: 2px;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  line-height: 12px;
  font-family: Arial, sans-serif;
  margin-right: 4px;
  font-style: italic;
}
.up-tag {
  padding: 0 3px;
  border-radius: 2px;
  background: var(--brand_pink);
  color: #fff;
  font-size: 10px;
  line-height: 13px;
}
.root-reply {
  position: relative;
  padding: 2px 0;
}
.reply-content-container {
  display: block;
  font-size: 15px;
  line-height: 24px;
  color: var(--text1);
  word-break: break-word;
}
.top-icon {
  display: inline-block;
  height: 18px;
  padding: 0 4px;
  margin-right: 5px;
  border: 1px solid var(--brand_pink);
  border-radius: 3px;
  color: var(--brand_pink);
  font-size: 12px;
  line-height: 16px;
  vertical-align: 2px;
}
:deep(.emote) {
  font-size: 18px;
  margin: 0 1px;
  vertical-align: -1px;
}
.reply-info {
  display: flex;
  align-items: center;
  margin-top: 4px;
  font-size: 13px;
  color: var(--text3);
}
.reply-time {
  margin-right: 20px;
}
.reply-like,
.reply-dislike {
  display: flex;
  align-items: center;
  margin-right: 19px;
  cursor: pointer;
}
.reply-like .bili-icon {
  margin-right: 5px;
}
.reply-like:hover,
.reply-dislike:hover,
.reply-btn:hover,
.reply-like.liked,
.reply-dislike.disliked {
  color: var(--brand_blue);
}
.reply-btn {
  cursor: pointer;
}
.reply-more {
  margin-left: auto;
  opacity: 0;
  cursor: pointer;
}
.reply-item:hover .reply-more {
  opacity: 1;
}
.reply-tag-list {
  margin-top: 6px;
}
.reply-tag {
  display: inline-block;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--bg2);
  color: var(--text2);
  font-size: 12px;
  line-height: 22px;
}
.sub-reply-container {
  padding-top: 4px;
}
.sub-reply-item {
  position: relative;
  padding: 8px 0 8px 33px;
  font-size: 15px;
  line-height: 24px;
  word-break: break-word;
}
.sub-avatar {
  position: absolute;
  left: 0;
  top: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--graph_bg_regular);
}
.sub-user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text2);
  margin-right: 5px;
}
.sub-reply-to {
  margin-right: 4px;
}
.sub-reply-to a {
  color: #008ac5;
}
.sub-reply-info {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--text3);
  margin-top: 2px;
}
.view-more {
  padding-left: 33px;
  font-size: 13px;
  color: var(--text3);
  line-height: 26px;
}
.view-more-btn {
  cursor: pointer;
}
.view-more-btn:hover {
  color: var(--brand_blue);
}
.pagination {
  padding-left: 33px;
  font-size: 13px;
  color: var(--text1);
  line-height: 26px;
}
.page {
  margin-left: 12px;
  cursor: pointer;
}
.page:hover {
  color: var(--brand_blue);
}
.page.cur {
  color: var(--brand_blue);
  font-weight: 500;
}
.inline-box {
  margin-top: 10px;
  margin-left: -80px;
}
.sub-reply-item .inline-box {
  margin-left: -113px;
}
.bottom-line {
  margin-top: 14px;
  border-bottom: 1px solid var(--graph_bg_thick);
}
.reply-end {
  margin-top: 20px;
  padding: 20px 0;
  text-align: center;
  font-size: 13px;
  color: var(--text3);
}
</style>
