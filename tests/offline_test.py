"""離線 PWA 驗收測試。

驗收條件：第一次訪問載入完成後，斷網再重新整理，所有功能正常；
恢復連線後有新版本時，會提示並能更新。

用本機伺服器模擬 Cloudflare 靜態網站的行為（/x.html 轉址到 /x、套用 _headers），
以全新的瀏覽器設定檔跑，不會靠之前留下的快取過關。

需求：pip install playwright，以及系統已安裝 Google Chrome。
執行：python3 tests/offline_test.py
"""
import json
import re
import shutil
import socket
import subprocess
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parent.parent
TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png',
         '.webmanifest': 'application/manifest+json'}


def parse_headers(root):
    rules, current = [], None
    for line in (root / '_headers').read_text().splitlines():
        if not line.strip():
            continue
        if not line[0].isspace():
            current = (line.strip(), [])
            rules.append(current)
        else:
            name, value = line.strip().split(':', 1)
            current[1].append((name, value.strip()))
    return rules


class PagesHandler(BaseHTTPRequestHandler):
    """模擬 Cloudflare 靜態網站：去副檔名轉址、套用 _headers。"""

    def log_message(self, *args):
        pass

    def do_GET(self):
        parts = urlsplit(self.path)
        path = unquote(parts.path)
        query = '?' + parts.query if parts.query else ''
        pretty = re.sub(r'/index(\.html)?$', '/', path)
        pretty = re.sub(r'\.html$', '', pretty)
        if pretty != path:
            self.send_response(308)
            self.send_header('Location', pretty + query)
            self.end_headers()
            return
        root = self.server.root
        file = root / (path.lstrip('/') + ('index.html' if path.endswith('/') else ''))
        if not file.is_file() and file.with_name(file.name + '.html').is_file():
            file = file.with_name(file.name + '.html')
        if not file.is_file() or file.name == '_headers':
            self.send_response(404)
            self.end_headers()
            return
        body = file.read_bytes()
        headers = {'Content-Type': TYPES.get(file.suffix, 'application/octet-stream'),
                   'Cache-Control': 'public, max-age=0, must-revalidate'}
        for pattern, pairs in parse_headers(root):
            if pattern == '/*' or pattern == path:
                headers.update(pairs)
        self.send_response(200)
        for name, value in headers.items():
            self.send_header(name, value)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def serve(root, port):
    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer(('127.0.0.1', port), PagesHandler)
    server.root = root
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server


def build(src):
    subprocess.run(['sh', 'build.sh'], cwd=src, check=True, capture_output=True)
    return src / 'dist'


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def check(cond, msg):
    if not cond:
        raise AssertionError(msg)
    print('  ✓', msg)


def wait_until(page, js, arg=None, timeout=15):
    # 不用 page.wait_for_function：它在 https 頁面會被網站的 CSP（禁止 eval）擋下
    for _ in range(timeout * 10):
        if page.evaluate(js, arg):
            return
        page.wait_for_timeout(100)
    raise AssertionError('timeout: ' + js)


def cache_state(page):
    return page.evaluate("""async () => {
        const names = (await caches.keys()).filter(n => n.startsWith('learn-japanese-'));
        const sizes = await Promise.all(names.map(async n => (await (await caches.open(n)).keys()).length));
        return { names, sizes };
    }""")


def main():
    tmp = Path(tempfile.mkdtemp())
    # v1：目前的程式碼；v2：改一個字的「新版本」，用來測更新
    v1 = shutil.copytree(build(REPO), tmp / 'v1')
    src2 = shutil.copytree(REPO, tmp / 'src2', ignore=shutil.ignore_patterns('.git', 'dist'))
    index = src2 / 'index.html'
    index.write_text(index.read_text().replace('<h1>五十音學習工具</h1>', '<h1>五十音學習工具 v2-test</h1>'))
    v2 = build(src2)

    port = free_port()
    base = f'http://localhost:{port}'
    csp_errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='chrome')
        ctx = browser.new_context()
        page = ctx.new_page()
        page.on('console', lambda m: m.type == 'error' and 'Content Security Policy' in m.text
                and csp_errors.append(m.text))
        page.on('pageerror', lambda e: csp_errors.append('pageerror: ' + str(e)))

        print('1. 第一次訪問')
        server = serve(v1, port)
        page.goto(base + '/')
        page.evaluate('window.__sameDoc = true')
        wait_until(page, "() => document.getElementById('offline-status').textContent.includes('已可離線')")
        check(True, '顯示「已可離線使用」')
        state = cache_state(page)
        check(len(state['names']) == 1 and state['sizes'] == [10], f'預先快取 10 個檔案 {state}')
        page.wait_for_timeout(500)
        check(page.evaluate('window.__sameDoc === true'), '第一次安裝不會自動重新載入頁面')
        check(page.locator('#pwa-update').count() == 0, '第一次安裝不顯示更新提示')

        print('2. 斷網（伺服器關閉 + 瀏覽器離線）')
        server.shutdown()
        server.server_close()
        ctx.set_offline(True)
        page.reload()
        check(page.locator('h1').inner_text() == '五十音學習工具', '首頁重新整理可開啟')
        page.goto(base + '/kana-trainer.html')
        wait_until(page, "() => document.getElementById('q-body').innerHTML.length > 0")
        check(True, '練習頁可開啟並出題')
        before = page.evaluate("localStorage.getItem('kana-trainer-v1')")
        if page.evaluate("S.q.type") == 'input':
            page.focus('#answer')
            page.keyboard.type('zz')
            page.keyboard.press('Enter')
        else:
            page.keyboard.press('1')
        # save() 有 200ms 防抖，等它寫進 localStorage
        wait_until(page, "b => localStorage.getItem('kana-trainer-v1') !== b", before)
        stats = json.loads(page.evaluate("localStorage.getItem('kana-trainer-v1')"))['stats']
        check(len(stats) > 0, '離線作答會記錄進度')
        page.reload()
        wait_until(page, "() => document.getElementById('q-body').innerHTML.length > 0")
        kept = json.loads(page.evaluate("localStorage.getItem('kana-trainer-v1')"))['stats']
        check(kept == stats, '重新整理後進度還在')
        titles = {'/kana-trainer': '50音練習', '/table.html?x=1': '五十音練習帳', '/index.html': '五十音學習工具',
                  '/table': '五十音練習帳'}
        for path, title in titles.items():
            page.goto(base + path)
            check(page.title() == title, f'{path} 可開啟（{title}）')
        check(page.evaluate("document.getElementById('sheets').innerHTML.length > 0"), '練習帳可產生表格')

        print('3. 恢復連線，伺服器上有新版本')
        server = serve(v2, port)
        ctx.set_offline(False)
        page.goto(base + '/')
        check('v2-test' not in page.locator('h1').inner_text(), '先顯示快取中的舊版本，不用等網路')
        page.wait_for_selector('#pwa-update', timeout=15000)
        check(True, '背景下載完新版本後出現「有新版本」提示')
        with page.expect_navigation():
            page.click('#pwa-update button')
        check('v2-test' in page.locator('h1').inner_text(), '按下重新整理後換成新版本')
        new_state = cache_state(page)
        check(len(new_state['names']) == 1 and new_state['names'] != state['names'], f'舊版快取已清除 {new_state}')

        print('4. 新版本也能離線')
        server.shutdown()
        server.server_close()
        ctx.set_offline(True)
        page.reload()
        check('v2-test' in page.locator('h1').inner_text(), '斷網重新整理是新版本')

        browser.close()

    check(not csp_errors, f'沒有 CSP 違規或頁面錯誤 {csp_errors}')
    shutil.rmtree(tmp)
    print('全部通過')


if __name__ == '__main__':
    main()
