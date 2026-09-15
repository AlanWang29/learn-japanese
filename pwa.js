// 註冊離線 Service Worker（sw.js）、顯示「已可離線使用」，有新版本時提示重新整理。
// github.io 不啟用：那是所有 AlanWang29 專案共用的網域，而且舊網址之後會改成搬家提示頁。
(function () {
  if (!('serviceWorker' in navigator) || location.hostname.endsWith('github.io')) return;

  const sw = navigator.serviceWorker;
  let updating = false;

  function showUpdate(worker) {
    if (document.getElementById('pwa-update')) return;
    const style = document.createElement('style');
    style.textContent =
      '#pwa-update{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);' +
      'z-index:9999;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:999px;' +
      'background:#1f2937;color:#f9fafb;font:14px system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
      '#pwa-update button{border:0;border-radius:999px;padding:6px 14px;background:#6ea8fe;color:#0b1220;' +
      'font:inherit;font-weight:600;cursor:pointer}' +
      '@media print{#pwa-update{display:none}}';
    const bar = document.createElement('div');
    bar.id = 'pwa-update';
    bar.innerHTML = '有新版本 <button type="button">重新整理</button>';
    bar.querySelector('button').onclick = () => { updating = true; worker.postMessage('SKIP_WAITING'); };
    document.head.appendChild(style);
    document.body.appendChild(bar);
  }

  sw.register('sw.js').then(reg => {
    // 安裝完成（預先快取成功）後 ready 才會成立，這時斷網也能用了。
    sw.ready.then(() => {
      const status = document.getElementById('offline-status');
      if (status) status.textContent = '✓ 已可離線使用';
    });

    // 已經有舊版本在服務時，新版本安裝好就提示；第一次安裝不提示。
    if (reg.waiting && sw.controller) showUpdate(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const worker = reg.installing;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && sw.controller) showUpdate(worker);
      });
    });

    // 瀏覽器每次開頁都會自動檢查更新；但加到主畫面的 App 可能在背景放很久都不重新載入，
    // 所以切回前景、恢復連線時再主動檢查一次。沒網路時檢查失敗就算了，繼續用快取。
    const check = () => reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    window.addEventListener('online', check);
  }).catch(() => { /* 註冊失敗（例如用 file:// 開啟）不影響使用 */ });

  sw.addEventListener('controllerchange', () => {
    // 只有按下「重新整理」的分頁才重新載入；其他分頁收起提示，下次換頁就是新版本。
    if (updating) location.reload();
    else document.getElementById('pwa-update')?.remove();
  });
})();
