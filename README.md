# bili-web-replica

高还原度的哔哩哔哩网页版仿站（纯前端，Vue 3 + Vite，数据为本地 mock）。

## 启动

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5280 。项目自带 `.npmrc`，用的是 npmmirror 源。

## 页面

| 路由 | 页面 | 已实现 |
| --- | --- | --- |
| `/` | 首页 | 透明头部 + Banner、滚动后吸顶白色头部和频道条、搜索下拉（历史/热搜）、头像悬浮面板、频道导航、轮播图、推荐流（换一换、无限滚动、骨架屏、直播卡片）、稍后再看 |
| `/video/:bvid` | 视频播放页 | 自研播放器（进度条拖拽/预览、倍速、清晰度、音量、画中画、宽屏、网页全屏、全屏、快捷键 空格/←→/↑↓/F/D/M/T）、滚动/顶部弹幕、发送弹幕（颜色/透明度/速度/字号）、点赞（长按一键三连）、投币/收藏弹窗、分享、简介展开、标签、UP 主卡片、弹幕列表（点击跳转）、接下来播放 + 自动连播、评论区（最热/最新、发评论、楼中楼回复、表情、分页） |
| `/search?keyword=` | 搜索结果 | 搜索框、分类 Tab、排序、更多筛选（时长/分区）、用户卡片、关键词高亮、分页 |
| `/space/:mid` | 个人空间 | Banner、头像信息、导航 Tab、统计数据、TA 的视频（排序）、收藏夹、动态、投稿搜索、侧栏资料 |
| `/popular/:type?` | 热门 | 综合热门、每周必看（期数切换）、入站必刷、排行榜（分区） |

## 目录

```
src/
  components/   BiliHeader 头部、VideoCard 视频卡片、Carousel 轮播、Player 播放器+弹幕、
                CommentSection 评论区、PaletteButtons 右下角按钮、Icon 图标、LazyImg 懒加载图片
  views/        Home / Video / Search / Space / Popular
  data/mock.js  固定种子的 mock 数据（视频、UP 主、评论、弹幕、热搜）
  styles/       全局样式与 B 站色板变量
```

## 说明

- 封面、头像图片来自 picsum.photos，视频源是 W3C 公开的示例视频（Sintel / Big Buck Bunny 等），都需要联网。
- 所有数据都是本地生成的假数据，登录、投稿、私信等入口只是演示提示。
- 仅供学习交流，“bilibili”名称与品牌归上海宽娱数码科技有限公司所有。
