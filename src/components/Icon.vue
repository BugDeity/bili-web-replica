<template>
  <svg
    class="bili-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="ICONS[name] || ''"
  />
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 20 },
  stroke: { type: [Number, String], default: 1.8 },
})

const F = 'fill="currentColor" stroke="none"'

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/>',
  tv: '<rect x="2" y="6" width="20" height="15" rx="4"/><path d="M7.5 2.5 10.5 6M16.5 2.5 13.5 6M8 12.5v2M16 12.5v2"/>',
  'play-count': '<rect x="2.5" y="4" width="19" height="16" rx="4"/><path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor"/>',
  danmaku: '<rect x="2.5" y="4" width="19" height="16" rx="4"/><path d="M7 10h4.5M7 14h10"/>',
  up: '<rect x="1.5" y="5" width="21" height="14" rx="3"/><path d="M6 9v3.5a2 2 0 0 0 4 0V9M13 15V9h2.3a1.8 1.8 0 0 1 0 3.6H13"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'watch-later': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  vip: '<path d="M3.5 8.5 8 12l4-6.5 4 6.5 4.5-3.5L18.6 19H5.4z"/>',
  message: '<path d="M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v10a1.5 1.5 0 0 1-1.5 1.5h-8.5L7 21v-3.5H4A1.5 1.5 0 0 1 2.5 16V6A1.5 1.5 0 0 1 4 4.5z"/><path d="M8 11h.01M12 11h.01M16 11h.01" stroke-width="2.6"/>',
  dynamic: '<path d="M3 9h11a3 3 0 1 0-3-3M3 13.5h15a3 3 0 1 1-3 3M3 18h6"/>',
  star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
  history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  creation: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  upload: '<path d="M12 16V5M7.5 9.5 12 5l4.5 4.5M5 19.5h14"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4.5h-4.5"/>',
  'arrow-up': '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
  'chevron-left': '<path d="M15 5l-7 7 7 7"/>',
  'chevron-right': '<path d="M9 5l7 7-7 7"/>',
  'chevron-down': '<path d="M5 9l7 7 7-7"/>',
  'chevron-up': '<path d="M5 15l7-7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  more: `<circle cx="5" cy="12" r="1.6" ${F}/><circle cx="12" cy="12" r="1.6" ${F}/><circle cx="19" cy="12" r="1.6" ${F}/>`,
  'more-v': `<circle cx="12" cy="5" r="1.6" ${F}/><circle cx="12" cy="12" r="1.6" ${F}/><circle cx="12" cy="19" r="1.6" ${F}/>`,
  play: `<path ${F} d="M7 4.6v14.8a1 1 0 0 0 1.5.86l12.4-7.4a1 1 0 0 0 0-1.72L8.5 3.74A1 1 0 0 0 7 4.6z"/>`,
  pause: `<rect x="6" y="4.5" width="4" height="15" rx="1.2" ${F}/><rect x="14" y="4.5" width="4" height="15" rx="1.2" ${F}/>`,
  next: `<path ${F} d="M5 5.6v12.8a1 1 0 0 0 1.5.85l10-6.4a1 1 0 0 0 0-1.7l-10-6.4A1 1 0 0 0 5 5.6z"/><rect x="17.5" y="5" width="2.4" height="14" rx="1.1" ${F}/>`,
  volume: `<path ${F} d="M3 9.5v5a1 1 0 0 0 1 1h3l4.4 3.7a.8.8 0 0 0 1.3-.6V5.4a.8.8 0 0 0-1.3-.6L7 8.5H4a1 1 0 0 0-1 1z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/>`,
  mute: `<path ${F} d="M3 9.5v5a1 1 0 0 0 1 1h3l4.4 3.7a.8.8 0 0 0 1.3-.6V5.4a.8.8 0 0 0-1.3-.6L7 8.5H4a1 1 0 0 0-1 1z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>`,
  fullscreen: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
  webfull: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M7.5 11V8.5H10M16.5 13v2.5H14"/>',
  widescreen: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 12h3M14.5 12h3M8 10.5 6.5 12 8 13.5M16 10.5l1.5 1.5-1.5 1.5"/>',
  pip: `<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><rect x="12" y="11.5" width="6.5" height="5" rx="1" ${F}/>`,
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8l2 2.1 2.9-.4.8 2.8 2.6 1.4-1 2.7 1 2.7-2.6 1.4-.8 2.8-2.9-.4-2 2.1-2-2.1-2.9.4-.8-2.8-2.6-1.4 1-2.7-1-2.7 2.6-1.4.8-2.8 2.9.4z"/>',
  'dm-on': '<rect x="2.5" y="4" width="19" height="16" rx="4"/><path d="M7 9.5h6M7 13h4M7 16.5h2.5"/><circle cx="17" cy="15" r="3.6" fill="currentColor" stroke="none"/><path d="M15.4 15l1.1 1.1 2-2.2" stroke="#fff" stroke-width="1.4"/>',
  'dm-off': '<rect x="2.5" y="4" width="19" height="16" rx="4"/><path d="M7 9.5h6M7 13h4M7 16.5h2.5"/><circle cx="17" cy="15" r="3.6" fill="currentColor" stroke="none"/><path d="M15.6 13.6l2.8 2.8M18.4 13.6l-2.8 2.8" stroke="#fff" stroke-width="1.4"/>',
  'dm-setting': '<rect x="2.5" y="4" width="19" height="16" rx="4"/><path d="M7 9.5h10M7 14.5h5"/><circle cx="16.5" cy="14.5" r="2"/>',
  subtitle: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M6.5 11.5h4M13 11.5h4.5M6.5 15h7M16 15h1.5"/>',
  fire: `<path ${F} d="M12 2c.6 3.2-1.4 4.6-3 6.6C7.4 10.6 6 12.6 6 15.2a6 6 0 0 0 12 0c0-2.1-.9-3.9-2-5.2-.3 1.6-1.1 2.6-2.1 3.1.6-3.6-.4-8.4-1.9-11.1z"/>`,
  'like-fill': `<path ${F} d="M2.5 10.6A1.6 1.6 0 0 1 4.1 9H6.4v12H4.1a1.6 1.6 0 0 1-1.6-1.6zM8.2 9l3.6-6.2a1.6 1.6 0 0 1 2.1-.6c1.4.8 2 2.4 1.6 3.9L14.8 9h4.8a2.4 2.4 0 0 1 2.3 3l-1.8 7.1A2.4 2.4 0 0 1 17.8 21H8.2z"/>`,
  'dislike-fill': `<path ${F} d="M2.5 13.4A1.6 1.6 0 0 0 4.1 15h2.3V3H4.1a1.6 1.6 0 0 0-1.6 1.6zM8.2 15l3.6 6.2a1.6 1.6 0 0 0 2.1.6c1.4-.8 2-2.4 1.6-3.9L14.8 15h4.8a2.4 2.4 0 0 0 2.3-3l-1.8-7.1A2.4 2.4 0 0 0 17.8 3H8.2z"/>`,
  like: '<path d="M7 10v10H4.2a1.2 1.2 0 0 1-1.2-1.2v-7.6A1.2 1.2 0 0 1 4.2 10zm0 0 3.8-6.4a1.7 1.7 0 0 1 2.3-.6 3 3 0 0 1 1.3 3.3L13.8 10h5a2 2 0 0 1 2 2.5l-1.6 6A2 2 0 0 1 17.3 20H7"/>',
  dislike: '<path d="M7 14V4H4.2A1.2 1.2 0 0 0 3 5.2v7.6A1.2 1.2 0 0 0 4.2 14zm0 0 3.8 6.4a1.7 1.7 0 0 0 2.3.6 3 3 0 0 0 1.3-3.3L13.8 14h5a2 2 0 0 0 2-2.5l-1.6-6A2 2 0 0 0 17.3 4H7"/>',
  'coin-fill': `<circle cx="12" cy="12" r="10" ${F}/><path d="M8.3 8.2h7.4M12 8.2v9M9 12.4h6" stroke="#fff" stroke-width="2"/>`,
  'fav-fill': `<path ${F} d="M12 2.4l2.9 5.9 6.5 1-4.7 4.5 1.1 6.5L12 17.2l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-1z" stroke="currentColor" stroke-width="1.2"/>`,
  'share-fill': `<path ${F} d="M13.2 4.2v3.9C7 8.7 3.6 12.8 3 19.6c2.4-3.4 5.6-5 10.2-5v3.9l8.3-7.1z" stroke="currentColor" stroke-width="1.2"/>`,
  charge: `<path ${F} d="M13.5 2 5 13.5h6L10 22l9-12h-6.3z"/>`,
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>',
  reply: '<path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-4.5 3v-3H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/>',
  article: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2 4 2 4H5"/>',
  community: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18.5 14.5a6.5 6.5 0 0 1 3 5.5"/>',
  live: '<rect x="2.5" y="6.5" width="19" height="13.5" rx="3"/><path d="M8 2.5l4 4 4-4M10 11v5l4-2.5z"/>',
  course: '<path d="M3 5.5a1 1 0 0 1 1-1h5a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H4a1 1 0 0 1-1-1zM21 5.5a1 1 0 0 0-1-1h-5a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H20a1 1 0 0 0 1-1z"/>',
  music: '<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  customer: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2.5" y="12.5" width="4" height="6" rx="1.5"/><rect x="17.5" y="12.5" width="4" height="6" rx="1.5"/><path d="M19.5 18.5c0 1.5-2 2.5-5 2.5"/>',
  feedback: '<path d="M4 4.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-4.5 3.5v-3.5H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/><path d="M8 10.5h8"/>',
  note: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h5M14 17.5l4-4"/>',
  report: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8 21h8M9 18h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  rocket: '<path d="M12 2.5c3.5 2.5 5 6 5 10l-2.5 3h-5L7 12.5c0-4 1.5-7.5 5-10zM9.5 15.5 7.5 20l3-1.5M14.5 15.5l2 4.5-3-1.5"/><circle cx="12" cy="9.5" r="1.6"/>',
  home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  logout: '<path d="M14 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h8M10 12h10.5M17 8.5l3.5 3.5-3.5 3.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20.5a8 8 0 0 1 16 0"/>',
  emoji: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" stroke-width="2.2"/>',
  at: '<circle cx="12" cy="12" r="3.8"/><path d="M15.8 8.2V13a2.5 2.5 0 0 0 5 0v-1a8.8 8.8 0 1 0-3.4 6.9"/>',
  image: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="M21 15.5l-5-5-9.5 9"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  'list-play': '<path d="M3 6h11M3 12h11M3 18h7M16 14.5v6l5-3z"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  filter: '<path d="M4 5h16l-6.5 8v6l-3 1.5V13z"/>',
}
</script>

<style scoped>
.bili-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
