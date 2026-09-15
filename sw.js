// 離線 Service Worker（預先快取 + 版本化更新）
//
// - 安裝時把 PRECACHE 全部抓進以版本命名的快取，全部成功才算安裝完成，
//   所以第一次訪問後就能離線使用，更新時也是整套一起換，不會新舊混用。
// - VERSION 由 build.sh 在部署時換成網站內容的雜湊；內容一變，瀏覽器就會偵測到
//   新版 sw.js，在背景安裝後由頁面（pwa.js）提示使用者重新整理套用。

const VERSION = '__VERSION__';
const PREFIX = 'learn-japanese-';
const CACHE = PREFIX + VERSION;

const PRECACHE = [
  './',
  'kana-trainer.html',
  'table.html',
  'kana-data.js',
  'pwa.js',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
];

// Cloudflare Pages 會把 /x.html 轉址到 /x、/index.html 轉址到 /，
// 所以快取一律用去掉副檔名與查詢字串的網址當 key，兩種寫法都對得到。
function cacheKey(url) {
  const u = new URL(url, self.location);
  u.search = '';
  u.hash = '';
  u.pathname = u.pathname.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '');
  return u.href;
}

const KEYS = new Set(PRECACHE.map(cacheKey));

// 轉址後拿到的回應不能直接拿去回應導覽請求（瀏覽器會拒絕），要複製成乾淨的回應。
async function cleanResponse(res) {
  if (!res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map(async path => {
      // cache: 'reload' 繞過瀏覽器的 HTTP 快取，確保存到的是這個版本的檔案。
      const res = await fetch(new URL(path, self.location), { cache: 'reload' });
      if (!res.ok) throw new Error('precache failed: ' + path + ' (' + res.status + ')');
      await cache.put(cacheKey(path), await cleanResponse(res));
    }));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // 只清自己前綴的舊快取：同網域下可能還有其他專案的快取。
    const names = await caches.keys();
    await Promise.all(names.filter(n => n.startsWith(PREFIX) && n !== CACHE).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const key = cacheKey(req.url);
  // 清單外的請求（例如 PDF、外部連結）交給瀏覽器照常處理。
  if (!KEYS.has(key)) return;
  event.respondWith(caches.match(key, { cacheName: CACHE }).then(hit => hit || fetch(req)));
});

// 使用者按下「重新整理」時，頁面會請等待中的新版本立即接手。
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
